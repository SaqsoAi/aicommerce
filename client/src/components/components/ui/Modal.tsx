"use client";

import {
motion,
} from "framer-motion";

export default function Modal({
children,
}: any) {
return (
<motion.div
initial={{
opacity: 0,
scale: 0.9,
}}
animate={{
opacity: 1,
scale: 1,
}}
exit={{
opacity: 0,
scale: 0.9,
}}
>
{children}
</motion.div>
);
}


