"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { FaUserFriends, FaVenus, FaMars } from "react-icons/fa";
import { Slider } from "@nextui-org/react";

export default function PreferencesForm() {
  const {
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const [selectedGenders, setSelectedGenders] = useState<string[]>(() => {
    const currentValue = getValues("preferredGenders");
    if (Array.isArray(currentValue)) {
      return currentValue;
    }
    if (typeof currentValue === "string" && currentValue) {
      return currentValue.split(",");
    }
    return [];
  });
  const [ageRange, setAgeRange] = useState([
    getValues("preferredAgeMin") || 18,
    getValues("preferredAgeMax") || 100,
  ]);

  const genderOptions = [
    {
      id: "female",
      label: "נשים",
      icon: FaVenus,
      gradient: "from-pink-400 to-pink-600",
      hoverGradient: "from-pink-500 to-pink-700",
    },
    {
      id: "male",
      label: "גברים",
      icon: FaMars,
      gradient: "from-blue-400 to-blue-600",
      hoverGradient: "from-blue-500 to-blue-700",
    },
  ];

  const handleGenderSelect = (genderId: string) => {
    let newSelection: string[];

    if (selectedGenders.includes(genderId)) {
      newSelection = selectedGenders.filter((g) => g !== genderId);
      if (newSelection.length === 0) {
        return;
      }
    } else {
      newSelection = [...selectedGenders, genderId];
    }

    setSelectedGenders(newSelection);
    setValue("preferredGenders", newSelection);
  };

  const handleAgeRangeChange = (value: number | number[]) => {
    const newRange = Array.isArray(value) ? value : [value, ageRange[1]];
    setAgeRange(newRange);
    setValue("preferredAgeMin", newRange[0]);
    setValue("preferredAgeMax", newRange[1]);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto px-4">
      <div className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-[#E37B27]"
        >
          מה אתה מחפש?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-xs"
        >
          בחר את ההעדפות שלך כדי לראות התאמות מדויקות
        </motion.p>
      </div>

      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base font-semibold text-gray-800 text-center"
        >
          מגדר מועדף
        </motion.h3>

        <div className="grid grid-cols-2 gap-3">
          {genderOptions.map((option, index) => {
            const isSelected = selectedGenders.includes(option.id);
            const IconComponent = option.icon;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenderSelect(option.id)}
                className={`
                  relative cursor-pointer rounded-xl p-4 transition-all duration-300 
                  ${
                    isSelected
                      ? `bg-gradient-to-br ${option.hoverGradient} shadow-lg shadow-${option.id === "female" ? "pink" : "blue"}-200 ring-2 ring-[#E37B27] ring-opacity-50`
                      : `bg-gradient-to-br ${option.gradient} hover:${option.hoverGradient} shadow-md hover:shadow-lg`
                  }
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 bg-[#E37B27] rounded-full p-1"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}

                <div className="flex flex-col items-center text-white space-y-2">
                  <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                    <IconComponent size={24} />
                  </div>
                  <span className="text-lg font-semibold">{option.label}</span>
                </div>

                {isSelected && (
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${option.gradient} blur-xl opacity-30 -z-10`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const bothSelected = ["male", "female"];
              setSelectedGenders(bothSelected);
              setValue("preferredGenders", bothSelected);
            }}
            className={`
              relative cursor-pointer rounded-xl p-4 transition-all duration-300 
              ${
                selectedGenders.length === 2
                  ? "bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-200 ring-2 ring-[#E37B27] ring-opacity-50"
                  : "bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 shadow-md hover:shadow-lg"
              }
            `}
          >
            {selectedGenders.length === 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 bg-[#E37B27] rounded-full p-1"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            <div className="flex flex-col items-center text-white space-y-2">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <FaUserFriends size={24} />
              </div>
              <span className="text-lg font-semibold">שניהם</span>
              <span className="text-xs opacity-80">פתוח לכל האפשרויות</span>
            </div>

            {selectedGenders.length === 2 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 blur-xl opacity-30 -z-10" />
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <h3 className="text-base font-semibold text-gray-800 text-center">
          טווח גילאים מועדף
        </h3>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-xl font-bold text-[#E37B27]">
                {ageRange[0]} - {ageRange[1]}
              </span>
              <span className="text-gray-600 mr-2">שנים</span>
            </div>

            <Slider
              value={ageRange}
              onChange={handleAgeRangeChange}
              minValue={18}
              maxValue={100}
              step={1}
              className="max-w-sm mx-auto"
              classNames={{
                base: "max-w-sm",
                track: "bg-gradient-to-r from-[#FFB547] to-[#E37B27]",
                thumb: "bg-[#E37B27] border-2 border-white shadow-lg",
              }}
            />
          </div>
        </div>
      </motion.div>

      {errors.preferredGenders && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm text-center"
        >
          {errors.preferredGenders.message as string}
        </motion.p>
      )}
    </div>
  );
}
