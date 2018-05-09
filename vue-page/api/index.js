import axios from "axios";

export const postData = body => {
  return axios.post("/api/data",body).then(res => res)
};
export const getInfo = ()=> {
  return axios.get("/api/info").then(res => res)
};