import { g, config, auth } from "@grafbase/sdk";

interface User {
  name: string;
  email: string;
  avatarUrl: string;
  description?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  projects?: Project[];
}

interface Project {
  title: string;
  description: string;
  image: string;
  liveSiteUrl: string;
  githubUrl: string;
  category: string;
  createdBy: User; // Assuming User is another type/interface defining the creator
}

const user: User = g
  .model("user", {
    name: g.string().length({ min: 2, max: 100 }),
    email: g.string().unique(),
    avatarUrl: g.url(),
    description: g.string().length({ min: 2, max: 1000 }).optional(),
    githubUrl: g.url().optional(),
    linkedinUrl: g.url().optional(),
    projects: g
      .relation(() => project)
      .list()
      .optional(),
  })
  .auth((rules) => {
    rules.public().read();
  });

const project: Project = g
  .model("project", {
    title: g.string().length({ min: 3 }),
    description: g.string(),
    image: g.url(),
    liveSiteUrl: g.url(),
    githubUrl: g.url(),
    category: g.string().search(),
    createdBy: g.relation(() => user),
  })
  .auth((rules) => {
    rules.public().read();
    rules.private().create().delete().update();
  });

const jwt = auth.JWT({
  issuer: "grafbase",
  secret: g.env("NEXTAUTH_SECRET"),
});

export default config({
  schema: g,
  auth: {
    providers: [jwt],
    rules: (rules) => rules.private(),
  },
});
