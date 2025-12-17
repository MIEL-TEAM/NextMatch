"use client";

import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaVenus, FaMars } from "react-icons/fa";
import { Slider } from "@nextui-org/react";

export default function PreferencesForm() {
  const {
    formState: { errors },
    setValue,
    getValues,
    trigger,
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

  // Two-step state: 1 = gender selection, 2 = age range
  const [step, setStep] = useState(selectedGenders.length > 0 ? 2 : 1);

  // Trigger validation on mount if values exist (fixes back navigation bug)
  useEffect(() => {
    if (selectedGenders.length > 0) {
      trigger(["preferredGenders", "preferredAgeMin", "preferredAgeMax"]);
    }
  }, []);

  const genderOptions = [
    {
      id: "female",
      label: "נשים",
      icon: FaVenus,
    },
    {
      id: "male",
      label: "גברים",
      icon: FaMars,
    },
  ];

  const handleGenderSelect = (genderId: string) => {
    let newSelection: string[];

    if (selectedGenders.includes(genderId)) {
      // Allow unselecting - true toggle behavior
      newSelection = selectedGenders.filter((g) => g !== genderId);
    } else {
      newSelection = [...selectedGenders, genderId];
    }

    setSelectedGenders(newSelection);
    // Trigger validation so parent form recognizes the change
    setValue("preferredGenders", newSelection, {
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const handleAgeRangeChange = (value: number | number[]) => {
    const newRange = Array.isArray(value) ? value : [value, ageRange[1]];
    setAgeRange(newRange);
    // Trigger validation for both age fields
    setValue("preferredAgeMin", newRange[0], {
      shouldValidate: true,
      shouldTouch: true,
    });
    setValue("preferredAgeMax", newRange[1], {
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="space-y-8 w-full">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Step 1: Gender Selection */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                מה אתה מחפש?
              </h2>
              <p className="text-sm text-gray-500">בחר את ההעדפות שלך</p>
            </div>

            <div className="space-y-4">
              {/* Individual gender options */}
              <div className="grid grid-cols-2 gap-4">
                {genderOptions.map((option) => {
                  const isSelected = selectedGenders.includes(option.id);
                  const IconComponent = option.icon;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGenderSelect(option.id)}
                      className={`
                        relative rounded-xl p-6 transition-all duration-200
                        border-2 bg-white
                        ${
                          isSelected
                            ? "border-[#E37B27] shadow-lg shadow-orange-100"
                            : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
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
                            className="w-3 h-3 text-white"
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

                      <div className="flex flex-col items-center space-y-3">
                        <div
                          className={`rounded-full p-4 transition-colors ${
                            isSelected
                              ? "bg-orange-50 text-[#E37B27]"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          <IconComponent size={28} />
                        </div>
                        <span
                          className={`text-base font-medium ${
                            isSelected ? "text-[#E37B27]" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Everyone option */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  // Toggle behavior for "Everyone" option
                  const isCurrentlySelected = selectedGenders.length === 2;
                  const newSelection = isCurrentlySelected
                    ? []
                    : ["male", "female"];
                  setSelectedGenders(newSelection);
                  setValue("preferredGenders", newSelection, {
                    shouldValidate: true,
                    shouldTouch: true,
                  });
                }}
                className={`
                  w-full relative rounded-xl p-6 transition-all duration-200
                  border-2 bg-white
                  ${
                    selectedGenders.length === 2
                      ? "border-[#E37B27] shadow-lg shadow-orange-100"
                      : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
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
                      className="w-3 h-3 text-white"
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

                <div className="flex items-center justify-center space-x-reverse space-x-4">
                  <div
                    className={`rounded-full p-4 transition-colors ${
                      selectedGenders.length === 2
                        ? "bg-orange-50 text-[#E37B27]"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <FaUserFriends size={28} />
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-base font-medium block ${
                        selectedGenders.length === 2
                          ? "text-[#E37B27]"
                          : "text-gray-700"
                      }`}
                    >
                      שניהם
                    </span>
                    <span className="text-xs text-gray-500">
                      פתוח לכל האפשרויות
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            {errors.preferredGenders && (
              <p className="text-red-500 text-sm text-center">
                {errors.preferredGenders.message as string}
              </p>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Step 2: Age Range */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                טווח גילאים מועדף
              </h2>
              <p className="text-sm text-gray-500">
                בחר את טווח הגילאים שמעניין אותך
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-[#E37B27]">
                    {ageRange[0]} - {ageRange[1]}
                  </span>
                  <span className="text-gray-600 mr-2 text-lg">שנים</span>
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

            {/* Back button to edit gender selection */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-[#E37B27] transition-colors"
            >
              ← חזרה לבחירת העדפות
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
