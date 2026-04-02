const prismaConfig = {
  schema: "./schema.prisma",
  db: {
    url: process.env.DATABASE_URL,
  },
};

export default prismaConfig;
