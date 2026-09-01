import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    className?: string;
    as?: 'div' | 'section' | 'main' | 'header' | 'footer';
    id?: string;
}

export default function Container({
    children,
    className = '',
    as: Tag = 'div',
    id,
    ...props
}: ContainerProps) {
    return (
        <Tag id={id} className={`min-h-dvh py-24 ${className}`} {...props}>
            {children}
        </Tag>
    );
}