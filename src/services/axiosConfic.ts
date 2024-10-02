import { ConfigPage } from "@/utils/config";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: ConfigPage.URL_BACKEND,
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
