import { useState } from "react";
import { motion } from "framer-motion";
import { BrandGuideline } from "@shared/schema";
import { Card } from "@/components/ui/card";
import {
  CircleIcon,
  SunIcon,
  MessageCircleIcon,
  HashIcon,
  VolumeIcon,
  TargetIcon,
} from "lucide-react";

interface BrandIdentityVisualizationProps {
  guideline: BrandGuideline;
}

export default function BrandIdentityVisualization({
  guideline,
}: BrandIdentityVisualizationProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full p-4">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Brand Values */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="col-span-1"
        >
          <Card
            className={`p-6 cursor-pointer hover:bg-accent/50 ${
              activeSection === "values" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setActiveSection("values")}
          >
            <div className="flex items-center gap-2 mb-4">
              <SunIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Core Values</h3>
            </div>
            <div className="space-y-2">
              {guideline.coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CircleIcon className="h-2 w-2 text-primary" />
                  <span>{value}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Brand Voice */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="col-span-1"
        >
          <Card
            className={`p-6 cursor-pointer hover:bg-accent/50 ${
              activeSection === "voice" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setActiveSection("voice")}
          >
            <div className="flex items-center gap-2 mb-4">
              <VolumeIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Brand Voice</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Primary:</span>
                <span className="text-primary">{guideline.voice}</span>
              </div>
              {guideline.detectedTone?.attributes && (
                <div className="flex flex-wrap gap-2">
                  {guideline.detectedTone.attributes.map((attr, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                    >
                      {attr}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Communication Style */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="col-span-1"
        >
          <Card
            className={`p-6 cursor-pointer hover:bg-accent/50 ${
              activeSection === "style" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setActiveSection("style")}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircleIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Communication Style</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Tone:</span>
                <span className="text-primary">{guideline.tone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Formality:</span>
                <div className="flex-1">
                  <div className="h-2 bg-primary/20 rounded-full">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(guideline.formalityScale / 5) * 100}%`,
                      }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Emoji Usage:</span>
                <span>{guideline.useEmojis ? "Yes" : "No"}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}