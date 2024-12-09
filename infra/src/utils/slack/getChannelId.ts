const env = process.env.ENVIRONMENT as 'dev' | 'prod';

const channels = {
  dev: 'C07386RL8NN',
  prod: 'C0739JQUZHQ'
};

export const getChannelId = () => channels[env];
