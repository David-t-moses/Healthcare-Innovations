import { motion } from "framer-motion";
import {
  FaHeartbeat,
  FaClinicMedical,
  FaUserMd,
  FaNotesMedical,
} from "react-icons/fa";

export const DecorativeSection = () => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="hidden md:block md:w-1/2 p-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-l-[80px] relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-pattern opacity-10" />

    {/* Floating Icons */}
    {[FaHeartbeat, FaClinicMedical, FaUserMd, FaNotesMedical].map(
      (Icon, index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -20, 0],
            rotate: [0, index % 2 === 0 ? 5 : -5, 0],
          }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
          className={`absolute text-white text-6xl opacity-20`}
          style={{
            top: `${20 + index * 25}%`,
            right: `${20 + index * 15}%`,
          }}
        >
          <Icon />
        </motion.div>
      )
    )}

    <div className="text-white space-y-6 relative z-10 mt-20">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold"
      >
        Welcome to Healthcare Innovation
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg opacity-90"
      >
        Transforming healthcare delivery through digital excellence
      </motion.p>

      <motion.ul
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="space-y-4 opacity-80"
      >
        <li>✓ 24/7 Medical Support</li>
        <li>✓ Secure Patient Records</li>
        <li>✓ Expert Healthcare Professionals</li>
        <li>✓ Advanced Medical Solutions</li>
      </motion.ul>
    </div>
  </motion.div>
);
