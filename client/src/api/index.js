import { mockAdapter } from "./adapters/mockAdapter";
import { httpAdapter } from "./adapters/httpAdapter";

// If VITE_USE_MOCK is 'false', use the real HTTP adapter; otherwise default to mock
const isMock = import.meta.env.VITE_USE_MOCK !== "false";

export const api = isMock ? mockAdapter : httpAdapter;
export { mockAdapter, httpAdapter, isMock };
export default api;
