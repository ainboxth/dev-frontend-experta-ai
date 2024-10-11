import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface MaterialPickerProps {
  onMaterialSelect: (material: string) => void;
}

const MaterialPicker: React.FC<MaterialPickerProps> = ({ onMaterialSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof materials>("Wood");

  const categories = ["Wood", "Stone", "Metal", "Textiles", "Ceramic", "Concrete"] as const;

  const materials: { [key in (typeof categories)[number]]: string[] } = {
    Wood: ["Slatted Wood", "Plank Wood", "Parquet", "Plywood", "MDF", "Particleboard", "Reclaimed Wood", "Veneer"],
    Stone: ["Granite", "Marble", "Limestone", "Slate", "Quartz", "Travertine"],
    Metal: ["Steel", "Aluminum", "Brass", "Copper", "Stainless Steel", "Wrought Iron"],
    Textiles: ["Cotton", "Linen", "Wool", "Silk", "Synthetic"],
    Ceramic: ["Tiles", "Mosaic", "Terracotta", "Porcelain Tiles"],
    Concrete: ["Polished", "Stamped", "Precast", "Fiber Reinforced"],
  };

  const handleCategoryClick = (category: keyof typeof materials) => {
    setSelectedCategory(category);
  };

  const handleMaterialClick = (material: string) => {
    onMaterialSelect(material);
  };

  const getImagePath = (category: string, material: string) => {
    return `/materials/${category.toLowerCase()}/${material.replace(/\s+/g, "-").toLowerCase()}.svg`;
  };

  return (
    <div
      style={{
        width: "280px",
        background: "#1e1e1e",
        borderRadius: "10px",
        padding: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Materials</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "5px",
            width: "100%",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              style={{
                background: selectedCategory === category ? "#555" : "#333",
                border: "none",
                borderRadius: "10px",
                padding: "5px 10px",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "30px",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {materials[selectedCategory].map((material) => (
          <button
            key={material}
            onClick={() => handleMaterialClick(material)}
            style={{
              width: "80px",
              height: "80px",
              background: "#333",
              border: "none",
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "5px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                position: "relative",
                marginBottom: "5px",
              }}
            >
              <Image
                src={getImagePath(selectedCategory, material)}
                alt={material}
                layout="fill"
                objectFit="cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-image.svg";
                }}
              />
            </div>
            <span style={{ fontSize: "10px", textAlign: "center" }}>{material}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaterialPicker;
