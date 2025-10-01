import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/auth";

export const getClientSession = (): Promise<IronSession<SessionData>> => {
  return getIronSession<SessionData>(cookies(), sessionOptions);
};
