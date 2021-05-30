import { RootState } from "store/rootReducer";

export const getActiveUser = (state: RootState) => state.user.activeUser;
