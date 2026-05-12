import axiosInstance from "../../_uitils/axiosInstance";

export async function getCompetitions() {
  const res = await axiosInstance.get(`/competitions`);
  console.log(res);
  return res;
}
