import axios, { AxiosResponse } from 'axios'

export const callBackend = (api: string): Promise<AxiosResponse<any>> => {
  return axios.get(api)
}
