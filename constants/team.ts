export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  skills: string[];
}

export const teamMembers: TeamMember[] = [
  {
    name: "Simonas Aukštuolis",
    role: "Electrical Engineer & Material Scientist",
    description:
      "Versatile engineer with deep expertise in chemistry, electricity, and mechanics. Inventor of diverse systems spanning propulsion, materials, and electrical engineering.",
    image: "/images/team/simonas.png",
    skills: ["Propulsion Systems", "Chemistry", "Electrical Engineering", "CNC Machining", "3D Modeling"],
  },
  {
    name: "Ignas Mikolaitis",
    role: "Software Engineer & AI/ML Specialist",
    description:
      "Self-taught software engineer and official Google Awardee. Expert in full-stack development, cyber security, robotics, and AI systems.",
    image: "/images/team/ignas.png",
    skills: ["Full-Stack Dev", "AI/ML", "Robotics", "Cyber Security", "IoT"],
  },
  {
    name: "Dominykas Remeika",
    role: "Engineering & Product Development",
    description:
      "Product development specialist focused on manufacturing planning, 3D modeling, and data-driven design processes.",
    image: "/images/team/dominykas.jpg",
    skills: ["3D Modeling", "Manufacturing", "Fusion 360", "Data Analysis"],
  },
  {
    name: "Miglė Cirtautaitė",
    role: "Atmospheric Scientist & Technical Writer",
    description:
      "Atmospheric scientist driving the cloud seeding and weather modification research. Expert in technical documentation and data analysis.",
    image: "/images/team/migle.png",
    skills: ["Atmospheric Science", "Technical Writing", "Research", "Data Analysis"],
  },
  {
    name: "Dovydas Jusevičius",
    role: "3D Modeling & Engineering Specialist",
    description:
      "Engineering specialist with strong expertise in mechanical design, CAD modeling, and electronics integration.",
    image: "/images/team/dovydas.jpg",
    skills: ["SolidWorks", "FreeCAD", "Electronics", "Robotics", "Milling"],
  },
  {
    name: "Dominykas Mačiulaitis",
    role: "Physicist & Electronics Engineer",
    description:
      "Physicist and programmer bridging hardware and software. Expert in electrical engineering, embedded systems, and data analysis.",
    image: "/images/team/dominykasn.jpeg",
    skills: ["Electrical Engineering", "C++", "Python", "SOLIDWORKS", "Robotics"],
  },
  {
    name: "Julius Barauskas",
    role: "Manufacturing & Robotics Specialist",
    description:
      "Manufacturing and IT specialist combining CNC machining, robotics, and software engineering for cutting-edge production systems.",
    image: "/images/team/julius.png",
    skills: ["CNC Machining", "3D Modeling", "Electrical Engineering", "Software Engineering", "IoT"],
  },
];
