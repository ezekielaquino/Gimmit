const Git = require('simple-git')();
const { Select, Input } = require('enquirer');
const config = require('./config');
const random = require('random');
const fs = require('fs');

let options = [
  {
    label: 'Random',
    emoji: '🔀',
  },
];
let emojiPool = config.emojiPool;

try {
  if (fs.existsSync('.gimmitrc.json')) {
    const customConfig = JSON.parse(fs.readFileSync('.gimmitrc.json', 'utf8'));

    if (customConfig.options) {
      options = [
        ...options,
        ...customConfig.options,
      ].map((option, index) => {
        const key = index === 0 ? 'Key ' : '';
        return {
          ...option,
          label: `${option.label} [${key}${index}]`,
        };
      });
    }

    if (customConfig.emojiPool) {
      if (customConfig.emojiPool.length < 2) {
        throw 'Your custom emoji pool for random option length is less than 2. Please add more.';
      }

      emojiPool = customConfig.emojiPool;
    }
  }
} catch (err) {
  console.error(err);
}

const promptSelectType = new Select({
  name: 'type',
  message: 'Select commit flavor',
  choices: options.map(option => {
    return `${option.emoji} ${option.label}`;
  }),
});

const getRandomEmoji = () => {
  const randIndex = random.int(0, config.emojiPool.length);
  return emojiPool[randIndex];
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