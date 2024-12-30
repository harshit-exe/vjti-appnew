import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Briefcase, Users } from "lucide-react";
import { link } from "fs";
import Link from "next/link";

export default function ARVR() {
  const experiences = [
    {
      title: "VR Workspace",
      description: "Boost productivity with a customizable virtual office.",
      image:
        "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&q=80&w=1000",
      icon: <Briefcase className="h-6 w-6" />,
      features: [
        "Infinite Monitors",
        "Collaborative Whiteboards",
        "Virtual Meeting Rooms",
      ],
      link: "fap-ice-cxs#office-hex-1",
    },
    {
      title: "VR Movie Night",
      description:
        "Immerse yourself in a virtual cinema experience with friends.",
      image:
        "https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&q=80&w=1000",
      icon: <Film className="h-6 w-6" />,
      features: [
        "3D Surround Sound",
        "Multiple Virtual Theaters",
        "Social Viewing",
      ],
      link: "moviehalvjti",
    },
    {
      title: "VR GoKart Game",
      description: "Play with friends in exciting virtual environments.",
      image:
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1000",
      icon: <Users className="h-6 w-6" />,
      features: ["Customizable Kart", "Interactive Games", "Virtual Race"],
      link: "gamevjti",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-5xl font-bold text-center mb-12 text-blue-600 tracking-tight">
        Immersive VR Experiences
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.map((experience, index) => (
          <Card
            key={index}
            className="bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300 border-blue-100 border-2"
          >
            <div className="relative h-48">
              <img
                src={experience.image}
                alt={experience.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent opacity-70" />
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <div className="bg-white p-2 rounded-full">
                  {experience.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {experience.title}
                </h2>
              </div>
            </div>
            <CardContent className="pt-6">
              <CardDescription className="text-blue-700 mb-4">
                {experience.description}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mb-4">
                {experience.features.map((feature, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-blue-50 text-blue-600 border border-blue-200"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href={`${experience.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition duration-300 shadow-md hover:shadow-lg"
              >
               Experience Now
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
