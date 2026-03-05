import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealWrapperProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export default function RevealWrapper({ children, delay = 0, className = '' }: RevealWrapperProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay }}
        >
            {children}
        </motion.div>
    );
}
