import dotenv from 'dotenv';

dotenv.config();

export const ConfigPage = {
  //============== Development ================
  URL_WORK_IMG: `src/images/img2img`,
  URL_BACKEND: process.env.URL_BACKEND || "http://localhost:3000",
};