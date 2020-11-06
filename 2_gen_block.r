library(data.table)
library(ggplot2)
library(jsonlite)

dat <- fread('~/actlab/mental-rotation-obstacle/out.csv')
dat[, radius := round(radius)]
dat[, circle_angle := round(circle_angle)]
dat[, letter_angle := round(letter_angle)]
dat[, flip := as.integer(flip)]


# filter out conditions where pix_intersect > 0 atletter_angle==0
tmp <- dat[letter_angle==0 & pix_intersect == 0]
tmp[, c('pix_intersect', 'letter_angle') := NULL]
# these combos are valid (no intersection at 0 angle)
# ggplot(tmp, aes(x = radius, y = circle_angle, colour=paste(letter, flip))) + geom_jitter(width=1, height=0,size=2, alpha=0.8)

dat2 <- merge(dat, tmp, by=c('radius', 'circle_angle', 'letter', 'flip'))

# pick a few easy angles, and integer positions on circle
angles <- c(15, 30, 45, 60, 75, 90)
angles <- c(angles, -1*angles) 
possible_starts <- dat2[letter_angle %in% angles & pix_intersect == 0 & !circle_angle%%1]

possible_f <- possible_starts[letter=='f']
possible_r <- possible_starts[letter=='r']

# both F and R have a valid starting position for these combos
tmp2 <- merge(possible_f, possible_r, by=c('radius', 'circle_angle', 'flip', 'letter_angle'))
tmp2[, c('letter.x', 'pix_intersect.x', 'letter.y', 'pix_intersect.y') := NULL]

# both flip and non have a valid start
tmp_flip <- tmp2[flip==1]
tmp_not <- tmp2[flip==0]
tmp3 <- merge(tmp_flip, tmp_not, by=c('radius', 'circle_angle', 'letter_angle'))
tmp3[, c('flip.x', 'flip.y') := NULL]

# tmp3[, intersects_in_rotation := NA]
# tmp3 are ones to check whether there are intersections or not
out <- list()
counter <- 1
for (i in 1:nrow(tmp3))
{
  cur_row <- tmp3[i]
  # now check F, R, flip, not
  if (cur_row[['letter_angle']] > 0)
  {
    tmpfoo <- dat[circle_angle==cur_row[['circle_angle']] & radius==cur_row[['radius']] & letter_angle > 0 & letter_angle < cur_row[['letter_angle']]]
  } else {
    tmpfoo <- dat[circle_angle==cur_row[['circle_angle']] & radius==cur_row[['radius']] & letter_angle > cur_row[['letter_angle']] & letter_angle < 0]
  }
  summarized <- tmpfoo[, .(intersect = sum(pix_intersect) > 0, cumu_intersect = sum(pix_intersect)), by=c('letter', 'flip')]
  summarized <- cbind(summarized, cur_row)
  out[[i]] <- summarized
  
}

out <- rbindlist(out)

"
we want a few things:
 - 'control': RT increases with greater letter_angle (both + and -), both letters (try to match circle_angle & radius)
     # * can probably relegate this to radius=100 (which usually )
 - position where non-flipped intersects, but flipped does not (and vice versa)
 - degree of intersection (cumu_intersect): not much vs a lot
 - ones where a higher angle (e.g. 60) intersects but a lower (e.g. 30) does not
 - even # occluded/non
 - even # CW/CCW
 - even # mirror/not
 - even # F/R
 - 3-5 repeats

"

####
trial_types <- list(
  ## F
  list(letter='f', radius=60, flip=1, letter_angle=-60, circle_angle=191), # collide
  list(letter='f', radius=60, flip=1, letter_angle=-60, circle_angle=326), # control
  list(letter='f', radius=80, flip=1, letter_angle=60, circle_angle=270), # collide
  list(letter='f', radius=80, flip=1, letter_angle=60, circle_angle=180), # control
  #
  list(letter='f', radius=80, flip=0, letter_angle=-60, circle_angle=270), # collide
  list(letter='f', radius=80, flip=0, letter_angle=-60, circle_angle=292), # control
  list(letter='f', radius=60, flip=0, letter_angle=60, circle_angle=315), # collide
  list(letter='f', radius=60, flip=0, letter_angle=60, circle_angle=191), # control
  ## R
  list(letter='r', radius=60, flip=1, letter_angle=-60, circle_angle=225), # collide
  list(letter='r', radius=60, flip=1, letter_angle=-60, circle_angle=326), # control
  list(letter='r', radius=60, flip=1, letter_angle=60, circle_angle=349), # collide
  list(letter='r', radius=60, flip=1, letter_angle=60, circle_angle=214), # control
  #
  list(letter='r', radius=60, flip=0, letter_angle=-60, circle_angle=214), # collide
  list(letter='r', radius=60, flip=0, letter_angle=-60, circle_angle=326), # control
  list(letter='r', radius=100, flip=0, letter_angle=60, circle_angle=56), # collide
  list(letter='r', radius=100, flip=0, letter_angle=60, circle_angle=180), # control
  ## a few 30 deg
  #list(letter='f', radius=100, flip=1, letter_angle=30, circle_angle=56), # collide
  list(letter='f', radius=100, flip=1, letter_angle=-30, circle_angle=124), # collide
  #list(letter='f', radius=100, flip=1, letter_angle=30, circle_angle=79), # control
  list(letter='f', radius=80, flip=1, letter_angle=-30, circle_angle=11), # control
  #
  list(letter='f', radius=100, flip=0, letter_angle=30, circle_angle=56), # collide
  #list(letter='f', radius=100, flip=0, letter_angle=-30, circle_angle=124), # collide
  list(letter='f', radius=100, flip=0, letter_angle=30, circle_angle=101), # control
  #list(letter='f', radius=80, flip=0, letter_angle=-30, circle_angle=169), # control
  #
  list(letter='r', radius=100, flip=1, letter_angle=-30, circle_angle=124), # collide
  list(letter='r', radius=100, flip=1, letter_angle=-30, circle_angle=79), # control
  list(letter='r', radius=100, flip=0, letter_angle=30, circle_angle=56), # collide
  list(letter='r', radius=80, flip=0, letter_angle=30, circle_angle=247) # control
)
tmp4 <- rbindlist(trial_types)

# get out the labels
tmp5 <- merge(out, tmp4)

# add controls-- all the possible ones have valid 0 positions, so we can just duplicate twice
# and set letter_angle=0 (which also sort of works out)
ctrls <- tmp5[rep(tmp5[, .I], 1)]
ctrls[, letter_angle := 0]
ctrls[, intersect := FALSE]
ctrls[, cumu_intersect := 0]
# fix the one duplicate in the control set
ctrls[duplicated(ctrls), circle_angle := 34]

exps <- tmp5[rep(tmp5[, .I], 1)]

# now we'll convert to JSON for consumption by the exp
# one warmup block

# specify explicit names (we probably won't make it any longer, anyway)
# reps taken care of here too, not randomization.
# we'll divvy it up into 4 blocks 
out_all <- list(
  warmup=ctrls[rep(ctrls[, .I], 2)], 
  real=rbind(ctrls[rep(ctrls[, .I], 2)],
             exps[rep(exps[, .I], 4)])
)
out_json <- toJSON(out_all, auto_unbox=TRUE)

write(out_json, file='~/actlab/mental-rotation-obstacle/src/assets/trials.json')

