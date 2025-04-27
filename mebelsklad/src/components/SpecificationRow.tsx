// components/SpecificationRow.tsx

import React from 'react';

interface SpecificationRowProps {
    label: string;
    value: string | number;
}

const SpecificationRow: React.FC<SpecificationRowProps> = ({ label, value }) => {
    return (
        <div className="py-3 flex justify-between border-b border-gray-200">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
};

export default SpecificationRow;
