import "./styles.css";
import React, { useState, useEffect } from "react";

const initialData = [
  {
    id: "electronics",
    label: "Electronics",
    value: 1500,
    children: [
      { id: "phones", label: "Phones", value: 800 },
      { id: "laptops", label: "Laptops", value: 700 },
    ],
  },
  {
    id: "furniture",
    label: "Furniture",
    value: 1000,
    children: [
      { id: "tables", label: "Tables", value: 300 },
      { id: "chairs", label: "Chairs", value: 700 },
    ],
  },
];

const calculateParentTotal = (children) =>
  children.reduce((sum, child) => sum + child.value, 0);

export default function App() {
  const [data, setData] = useState([]);
  const [originalValues, setOriginalValues] = useState({});
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    const originalMap = {};
    const mapValues = (rows) => {
      rows.forEach((row) => {
        originalMap[row.id] = row.value;
        if (row.children) mapValues(row.children);
      });
    };
    mapValues(initialData);
    setOriginalValues(originalMap);
    setData(initialData);
  }, []);

  const handleInputChange = (id, value) => {
    setInputs({ ...inputs, [id]: value });
  };

  const calculateVariance = (newValue, originalValue) => {
    return originalValue
      ? (((newValue - originalValue) / originalValue) * 100).toFixed(2)
      : "0.00";
  };

  const applyPercentage = (id, percent) => {
    const updatedData = updateValue(id, (value) =>
      Math.round(value * (1 + percent / 100))
    );
    setInputs({ ...inputs, [id]: null });
    setData(updatedData);
  };

  const applyValue = (id, newValue) => {
    const updatedData = updateValue(id, () => parseInt(newValue, 10), true);
    setData(updatedData);
    setInputs({ ...inputs, [id]: null });
  };

  const updateValue = (id, calculateNewValue, isParentUpdate = false) => {
    const recursiveUpdate = (rows) =>
      rows.map((row) => {
        if (row.id === id) {
          const newValue = calculateNewValue(row.value);
          let updatedChildren = row.children;

          if (isParentUpdate && row.children) {
            const totalCurrentValue = calculateParentTotal(row.children);
            updatedChildren = row.children.map((child) => {
              const proportion = child.value / totalCurrentValue;
              return {
                ...child,
                value: Math.round(newValue * proportion * 100) / 100,
              };
            });
          }

          return {
            ...row,
            value: newValue,
            children: updatedChildren,
          };
        }

        if (row.children) {
          const updatedChildren = recursiveUpdate(row.children);
          return {
            ...row,
            children: updatedChildren,
            value: calculateParentTotal(updatedChildren),
          };
        }
        return row;
      });

    return recursiveUpdate(data);
  };

  const renderRows = (rows, depth = 0) =>
    rows.map((row) => (
      <React.Fragment key={row.id}>
        <tr>
          {console.log(rows)}
          <td style={{ paddingLeft: `${depth * 20}px` }}>{row.label}</td>
          <td>{row.value}</td>
          <td>
            <input
              type="number"
              value={inputs[row.id] || ""}
              onChange={(e) => handleInputChange(row.id, e.target.value)}
            />
          </td>
          <td>
            <button
              onClick={() =>
                applyPercentage(row.id, Number(inputs[row.id] || 0))
              }
            >
              Allocation %
            </button>
          </td>
          <td>
            <button onClick={() => applyValue(row.id, inputs[row.id])}>
              Allocation Val
            </button>
          </td>
          <td>{calculateVariance(row.value, originalValues[row.id])} %</td>
        </tr>
        {row.children && renderRows(row.children, depth + 1)}
      </React.Fragment>
    ));

  const grandTotal = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <div>
      <h1>Hierarchical Table</h1>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>{renderRows(data)}</tbody>
        <tfoot>
          <tr>
            <td>
              <strong>Grand Total</strong>
            </td>
            <td>{grandTotal}</td>
            <td colSpan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
