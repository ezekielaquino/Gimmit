const Git = require('simple-git/promise')();
const { Select, Input, Confirm } = require('enquirer');
const config = require('./config');
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
      ];
    }

    if (customConfig.emojiPool) {
      if (customConfig.emojiPool.length < 2) {
        throw 'Your custom emoji pool for random option length is less than 2. Please add more.';
      }

      emojiPool = customConfig.emojiPool;
    }
  } else {
    options = [
      ...options,
      ...config.options,
    ];
  }

  options = options.map((option, index) => {
    const key = index === 0 ? 'Key ' : '';
    return {
      ...option,
      label: `${option.label} [${key}${index}]`,
    };
  });
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

const promptPushToGit = new Confirm({
  name: 'question',
  message: 'Would you like to push to remote (current branch)?',
});

const getRandomEmoji = () => {
  const randIndex = Math.floor(Math.random() * config.emojiPool.length);
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

        promptPushToGit.run()
          .then(isPush => {
            if (isPush) {
              console.log('📡 Pushing to remote...');

              Git.push('origin', 'HEAD')
                .then(() => {
                  console.log('✅ Succesfully pushed to remote!');
                })
                .catch(() => {
                  console.log('👎 Push to remote failed.');
                });
              
            } else {
              console.log('✅ Commit success!');
            }
          })
          .catch(onCancel);
      })
      .catch(onCancel);
  })
  .catch(onCancel);