import { useEffect, useState } from "react";

export default function useDebounces<T>(value: T, delay: number = 250) {
    const [deBouncedValue, setDeBouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDeBouncedValue(value)
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return deBouncedValue;
}