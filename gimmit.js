const Git = require('simple-git')();
const { Select, Input } = require('enquirer');
const config = require('./config');
const random = require('random');

const promptSelectType = new Select({
  name: 'type',
  message: 'Select commit flavor',
  choices: config.options.map(option => {
    return `${option.emoji} ${option.label}`;
  }),
});

const getRandomEmoji = () => {
  const randIndex = random.int(0, config.emojiPool.length);
  return config.emojiPool[randIndex];
};

const onCancel = () => {
  console.log('💃 Cancelled gimmiting');
};

promptSelectType.run()
  .then(answer => {
    const emoji = answer.includes('Random') ? getRandomEmoji() : answer.split(' ')[0];

    new Input({
      message: `${emoji} Enter your commit message`,
    })
      .run()
      .then(message => {
        Git.commit(`${emoji} ${message}`);
        console.log('✅ Success! You can now git push!');
      })
      .catch(onCancel);
  })
  .catch(onCancel);