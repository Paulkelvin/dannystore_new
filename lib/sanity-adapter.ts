import { Adapter } from "next-auth/adapters";
import { sanityClientWrite } from "./sanityClient";

export function SanityAdapter(): Adapter {
  return {
    async createUser(data) {
      console.log('SanityAdapter.createUser called with:', data);
      const user = await sanityClientWrite.create({
        _type: "user",
        email: data.email,
        name: data.name || data.email.split('@')[0],
        image: data.image,
        emailVerified: data.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('SanityAdapter.createUser created:', user);
      // Link guest orders to this user
      const guestOrders = await sanityClientWrite.fetch(
        `*[_type == "order" && customerEmail == $email && !defined(user)]{_id}`,
        { email: data.email }
      );
      if (guestOrders && guestOrders.length > 0) {
        const transaction = sanityClientWrite.transaction();
        guestOrders.forEach((order: any) => {
          transaction.patch(order._id).set({ user: { _type: 'reference', _ref: user._id } });
        });
        await transaction.commit();
        console.log(`Linked ${guestOrders.length} guest orders to user ${user._id}`);
      }
      return {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },

    async getUser(id) {
      const user = await sanityClientWrite.fetch(
        `*[_type == "user" && _id == $id][0]`,
        { id }
      );

      if (!user) return null;

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },

    async getUserByEmail(email) {
      const user = await sanityClientWrite.fetch(
        `*[_type == "user" && email == $email][0]`,
        { email }
      );
      console.log('SanityAdapter.getUserByEmail:', user);
      if (!user) return null;
      return {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await sanityClientWrite.fetch(
        `*[_type == "account" && provider == $provider && providerAccountId == $providerAccountId][0]{
          user-> {
            _id,
            email,
            name,
            image,
            emailVerified
          }
        }`,
        { provider, providerAccountId }
      );

      if (!account?.user) return null;

      return {
        id: account.user._id,
        email: account.user.email,
        name: account.user.name,
        image: account.user.image,
        emailVerified: account.user.emailVerified,
      };
    },

    async updateUser(data) {
      const user = await sanityClientWrite.fetch(
        `*[_type == "user" && _id == $id][0]`,
        { id: data.id }
      );

      if (!user) throw new Error("User not found");

      const updates: any = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(updates).forEach(key => 
        updates[key] === undefined && delete updates[key]
      );

      const updatedUser = await sanityClientWrite
        .patch(user._id)
        .set(updates)
        .commit();

      return {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
      };
    },

    async linkAccount(data) {
      await sanityClientWrite.create({
        _type: "account",
        user: { _type: 'reference', _ref: data.userId },
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },

    async createSession(data) {
      const session = await sanityClientWrite.create({
        _type: "session",
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: new Date(session.expires),
      };
    },

    async getSessionAndUser(sessionToken) {
      const session = await sanityClientWrite.fetch(
        `*[_type == "session" && sessionToken == $sessionToken][0]`,
        { sessionToken }
      );
      if (!session) return null;
      const user = await sanityClientWrite.fetch(
        `*[_type == "user" && _id == $id][0]`,
        { id: session.userId }
      );
      if (!user) return null;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
        },
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        },
      };
    },

    async updateSession(data) {
      const session = await sanityClientWrite.fetch(
        `*[_type == "session" && sessionToken == $sessionToken][0]`,
        { sessionToken: data.sessionToken }
      );

      if (!session) throw new Error("Session not found");

      const updatedSession = await sanityClientWrite
        .patch(session._id)
        .set({
          expires: data.expires,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return {
        sessionToken: updatedSession.sessionToken,
        userId: updatedSession.userId,
        expires: updatedSession.expires,
      };
    },

    async deleteSession(sessionToken) {
      const session = await sanityClientWrite.fetch(
        `*[_type == "session" && sessionToken == $sessionToken][0]`,
        { sessionToken }
      );

      if (session) {
        await sanityClientWrite.delete(session._id);
      }
    },

    async createVerificationToken(data) {
      const token = await sanityClientWrite.create({
        _type: "verificationToken",
        identifier: data.identifier,
        token: data.token,
        expires: data.expires,
        createdAt: new Date().toISOString(),
      });

      return {
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await sanityClientWrite.fetch(
        `*[_type == "verificationToken" && identifier == $identifier && token == $token][0]`,
        { identifier, token }
      );
      console.log('SanityAdapter.useVerificationToken:', verificationToken);
      if (!verificationToken) return null;
      // Delete the token after use
      await sanityClientWrite.delete(verificationToken._id);
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires),
      };
    },

    async deleteUser(userId) {
      // Delete all related data
      const [user, accounts, sessions] = await Promise.all([
        sanityClientWrite.fetch(`*[_type == "user" && _id == $userId][0]`, { userId }),
        sanityClientWrite.fetch(`*[_type == "account" && user._ref == $userId]`, { userId }),
        sanityClientWrite.fetch(`*[_type == "session" && userId == $userId]`, { userId }),
      ]);

      if (user) {
        const transaction = sanityClientWrite.transaction();
        
        // Delete accounts
        accounts.forEach((account: any) => {
          transaction.delete(account._id);
        });

        // Delete sessions
        sessions.forEach((session: any) => {
          transaction.delete(session._id);
        });

        // Delete user
        transaction.delete(user._id);

        await transaction.commit();
      }
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const account = await sanityClientWrite.fetch(
        `*[_type == "account" && provider == $provider && providerAccountId == $providerAccountId][0]`,
        { provider, providerAccountId }
      );

      if (account) {
        await sanityClientWrite.delete(account._id);
      }
    },
  };
} 