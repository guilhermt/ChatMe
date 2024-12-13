import { configEnv } from '../../config';

const env = configEnv.env as 'dev' | 'prod';

const channels = {
  dev: 'C07386RL8NN',
  prod: 'C0739JQUZHQ'
};

export const getChannelId = () => channels[env];
