import { motion } from "framer-motion";

export const CartoonDog = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Head */}
            <circle cx="100" cy="100" r="60" fill="#FFCBA4" /> {/* Light Brown/Peach */}

            {/* Ears - Wiggle Animation */}
            <motion.ellipse
                cx="50" cy="90" rx="20" ry="40" fill="#E6A07C"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            />
            <motion.ellipse
                cx="150" cy="90" rx="20" ry="40" fill="#E6A07C"
                animate={{ rotate: [5, -5, 5] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            />

            {/* Eyes - Blink Animation */}
            <motion.g
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            >
                <circle cx="80" cy="90" r="8" fill="#544C4A" />
                <circle cx="120" cy="90" r="8" fill="#544C4A" />
                <circle cx="82" cy="88" r="3" fill="white" />
                <circle cx="122" cy="88" r="3" fill="white" />
            </motion.g>

            {/* Snout */}
            <ellipse cx="100" cy="115" rx="25" ry="18" fill="#FFFBF6" />
            <path d="M90,110 Q100,120 110,110" fill="none" stroke="#544C4A" strokeWidth="2" strokeLinecap="round" />
            <motion.ellipse
                cx="100" cy="108" rx="8" ry="6" fill="#544C4A"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Tongue - Panting Animation */}
            <motion.path
                d="M95,128 Q100,140 105,128"
                fill="#FF8E8E"
                initial={{ height: 0 }}
                animate={{ height: [0, 10, 0] }} // Simplified panting effect visualization
            />
        </motion.g>
    </svg>
);

export const CartoonCat = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Head */}
            <circle cx="100" cy="100" r="55" fill="#E2E8F0" />

            {/* Ears */}
            <path d="M60,70 L50,30 L90,60 Z" fill="#CBD5E1" />
            <path d="M140,70 L150,30 L110,60 Z" fill="#CBD5E1" />

            {/* Eyes */}
            <motion.g
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 5 }}
            >
                <ellipse cx="80" cy="95" rx="8" ry="12" fill="#544C4A" />
                <ellipse cx="120" cy="95" rx="8" ry="12" fill="#544C4A" />
            </motion.g>

            {/* Nose & Whiskers */}
            <circle cx="100" cy="110" r="4" fill="#FF8E8E" />
            <path d="M100,110 L90,120 M100,110 L110,120" stroke="#544C4A" strokeWidth="2" />

            <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}>
                <line x1="120" y1="105" x2="150" y2="100" stroke="#94A3B8" strokeWidth="2" />
                <line x1="120" y1="110" x2="150" y2="110" stroke="#94A3B8" strokeWidth="2" />
                <line x1="80" y1="105" x2="50" y2="100" stroke="#94A3B8" strokeWidth="2" />
                <line x1="80" y1="110" x2="50" y2="110" stroke="#94A3B8" strokeWidth="2" />
            </motion.g>
        </motion.g>
    </svg>
);
