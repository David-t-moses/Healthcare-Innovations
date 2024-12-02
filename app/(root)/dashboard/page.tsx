"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Calendar from "@/components/Calender";
// import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import FinancialWidget from "@/components/FinancialWidget";
import StaffOverview from "@/components/StaffOverview";
import StockWidget from "@/components/StockWidget";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

const defaultLayout = [
  { id: "calendar", title: "Calendar", size: "lg" },
  { id: "financial", title: "Financial Overview", size: "md" },
  { id: "staff", title: "Staff On Duty", size: "md" },
  { id: "stock", title: "Stock Status", size: "sm" },
];

export default function DashboardContent() {
  const [widgets, setWidgets] = useState(defaultLayout);
  // const { isLoading, user } = useAuth();

  // if (isLoading) {
  //   return <LoadingSpinner message="Loading your dashboard..." />;
  // }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="dashboard" direction="vertical">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      bg-gray-100 rounded-xl shadow-lg overflow-hidden
                      ${
                        widget.size === "lg"
                          ? "md:col-span-2 lg:col-span-3"
                          : ""
                      }
                      ${
                        widget.size === "md"
                          ? "md:col-span-1 lg:col-span-2"
                          : ""
                      }
                      ${widget.size === "sm" ? "col-span-1" : ""}
                    `}
                    style={{
                      ...provided.draggableProps.style,
                      transform: snapshot.isDragging
                        ? provided.draggableProps.style?.transform
                        : "none",
                    }}
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
                      <h3 className="font-semibold">{widget.title}</h3>
                      <button className="p-1 hover:bg-blue-400 rounded">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      {widget.id === "calendar" && <Calendar />}
                      {widget.id === "financial" && <FinancialWidget />}
                      {widget.id === "staff" && <StaffOverview />}
                      {widget.id === "stock" && <StockWidget />}
                    </div>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
