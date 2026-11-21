import { defineRelationsPart } from "drizzle-orm";
import { schema } from "./schema.server";

export const authRelations = defineRelationsPart(schema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
}));

export const gearRelations = defineRelationsPart(schema, (r) => ({
  softwareItem: {
    disclosure: r.one.disclosureMessage({
      from: r.softwareItem.disclosureMessageId,
      to: r.disclosureMessage.id,
    }),
  },
}));

export const relations = {
  ...authRelations,
  ...gearRelations,
};
