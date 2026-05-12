// src/libs/api/football/footballInstance.ts
import axios from "axios";

const footballInstance = axios.create({
  baseURL: "/api/football",
});

export default footballInstance;
