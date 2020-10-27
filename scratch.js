// Sam's original code (for ref)
//based on example code from https://www.jspsych.org/

/* create timeline */
var timeline = []

var hello_trial = {
  type: 'html-keyboard-response',
  stimulus: 'Welcome to the flipped letter task! <br> Press any key to begin.',
}
timeline.push(hello_trial)

var instructions = {
  type: 'html-keyboard-response',
  stimulus:
    '<p>In this experiment, a letter (R or F) will appear on the screen ' +
    '</p><p>Sometimes the letter will be <strong>NORMAL</strong>, ' +
    ', just an R or an F.</p>' +
    '<p>Sometimes the letter will be <strong>FLIPPED</strong>, ' +
    ', for example Я or ꟻ</p>' +
    '<p>Press the <strong>RIGHT</strong> arrow when the letter is <strong>NORMAL</strong></p>' +
    '<p>Press the <strong>LEFT</strong> arrow when the letter is <strong>FLIPPED</strong></p>' +
    '<p>Two other things: 1) the letters will often be rotated, making the task harder, and ' +
    ' 2) there will sometimes be black triangles near the letters. Please ignore the black triangles.</p>' +
    '<p>Press any key to begin.</p>',
  post_trial_gap: 1000,
}
timeline.push(instructions)

var all_images = [
  '0deg1Fmir.png',
  '0deg1Fnorm.png',
  '0deg1Rmir.png',
  '0deg1Rnorm.png',
  '0deg2Fmir.png',
  '0deg2Fnorm.png',
  '0deg2Rmir.png',
  '0deg2Rnorm.png',
  '30degnFmirBfast.png',
  '30degnFmirBslow.png',
  '30degnFnormBfast.png',
  '30degnFnormBslow.png',
  '30degnRmirBfast.png',
  '30degnRmirBslow.png',
  '30degnRnormBfast.png',
  '30degnRnormBslow.png',
  '30degpFmirBfast.png',
  '30degpFmirBslow.png',
  '30degpFnormBfast.png',
  '30degpFnormBslow.png',
  '30degpRmirBfast.png',
  '30degpRmirBslow.png',
  '30degpRnormBfast.png',
  '30degpRnormBslow.png',
  '60degnFmirBfast.png',
  '60degnFmirBslow.png',
  '60degnFnormBfast.png',
  '60degnFnormBslow.png',
  '60degnRmirBfast.png',
  '60degnRmirBslow.png',
  '60degnRnormBfast.png',
  '60degnRnormBslow.png',
  '60degpFmirBfast.png',
  '60degpFmirBslow.png',
  '60degpFnormBfast.png',
  '60degpFnormBslow.png',
  '60degpRmirBfast.png',
  '60degpRmirBslow.png',
  '60degpRnormBfast.png',
  '60degpRnormBslow.png',
]

var factors = {
  stimulus: all_images,
  fixation_duration: [1000],
}

var full_design = jsPsych.randomization.factorial(factors, 3) /* randomize, with 3 reps */

var fixation = {
  type: 'html-keyboard-response',
  stimulus: '+',
  trial_duration: jsPsych.timelineVariable('fixation_duration'),
  response_ends_trial: true,
}

// add all of the relevant variables to the data field so they
// will appear in the results
var trial = {
  type: 'html-keyboard-response',
  stimulus: function () {
    // note: the outer parentheses are only here so we can break the line
    return '<img src="' + jsPsych.timelineVariable('all_images', true) + '">'
  },
  data: {
    fixation_duration: jsPsych.timelineVariable('fixation_duration'),
    image: jsPsych.timelineVariable('all_images'),
    mirror: !jsPsych.timelineVariable('all_images').includes('norm'),
  },
}

var feedback = {
  type: 'single-stim',
  stimulus: function () {
    if (data.correct) {
      return '<p>correct!</p>'
    } else {
      return '<p>incorrect</p>'
    }
  },
}

var trials_with_variables = {
  timeline: [fixation, trial, feedback],
  timeline_variables: full_design,
}

// add a list of all images, these will be loaded right at the start
// to avoid delays
jsPsych.init({
  timeline: [trials_with_variables],
  on_finish: function () {
    jsPsych.data.displayData('csv')
  },
  preload_images: all_images,
})
