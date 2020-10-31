library(data.table)
library(ggplot2)

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

tmp3[, intersects_in_rotation := NA]
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
  summarized <- tmpfoo[, .(intersect = sum(pix_intersect) > 0), by=c('letter', 'flip')]
  summarized <- cbind(summarized, cur_row)
  out[[i]] <- summarized
  
}

out2 <- rbindlist(out)

