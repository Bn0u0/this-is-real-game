import React from 'react';

interface MenuButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'ghost';
    className?: string;
}

/**
 * Baba-style menu button component
 * @param label - Button text
 * @param onClick - Click handler
 * @param variant - 'primary' (filled) or 'ghost' (outlined)
 */
export const MenuButton: React.FC<MenuButtonProps> = ({
    label,
    onClick,
    variant = 'primary',
    className = ''
}) => {
    const baseClass = variant === 'primary' ? 'baba-btn' : 'baba-btn-ghost';

    return (
        <button
            onClick={onClick}
            className={`${baseClass} flex-1 py-4 ${className}`}
        >
            {label}
        </button>
    );
};
