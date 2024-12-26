"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Calendar from "@/components/Calender";
import FinancialWidget from "@/components/FinancialWidget";
import StaffOverview from "@/components/StaffOverview";
import StockWidget from "@/components/StockWidget";
import { WidgetMenu } from "@/components/WidgetMenu";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface Widget {
  id: string;
  title: string;
  size: "sm" | "md" | "lg";
  isMinimized?: boolean;
  isMaximized?: boolean;
}

const defaultLayout: Widget[] = [
  { id: "calendar", title: "Calendar", size: "lg" },
  { id: "financial", title: "Financial Overview", size: "md" },
  { id: "staff", title: "Staff On Duty", size: "md" },
  { id: "stock", title: "Stock Status", size: "sm" },
];

export default function DashboardContent({ searchTerm, userId }) {
  const [widgets, setWidgets] = useState(
    defaultLayout.map((widget) => ({
      ...widget,
      isMinimized: false,
      isMaximized: false,
    }))
  );
  const supabase = createClientComponentClient();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  const filterWidgetData = (data, term) => {
    if (!term) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const handleRefresh = async (widgetId: string) => {
    switch (widgetId) {
      case "calendar":
        const { data: appointments } = await supabase
          .from("appointments")
          .select("*");
        return filterWidgetData(appointments, searchTerm);
      case "financial":
        const { data: finances } = await supabase
          .from("financial_records")
          .select("*");
        return filterWidgetData(finances, searchTerm);
      case "staff":
        const { data: staff } = await supabase.from("staff_status").select("*");
        return filterWidgetData(staff, searchTerm);
      case "financial":
        const { data: stock } = await supabase.from("stock_items").select("*");
        return filterWidgetData(stock, searchTerm);
      //   case "staff":
      //     await supabase.from("staff_status").select("*");
      //     break;
      //   case "stock":
      //     await supabase.from("stock_items").select("*");
      //     break;
    }
  };

  const handleMinimize = (widgetId: string) => {
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, isMinimized: !widget.isMinimized, isMaximized: false }
          : widget
      )
    );
  };

  const handleMaximize = (widgetId: string) => {
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, isMaximized: !widget.isMaximized, isMinimized: false }
          : { ...widget, isMaximized: false }
      )
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="dashboard" direction="vertical" type="widget">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="min-h-screen bg-gradient-to-br p-4 overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative bg-white rounded-xl shadow-md transition-transform transform ${
                        snapshot.isDragging ? "scale-105 shadow-lg" : ""
                      } ${widget.id === "calendar" ? "col-span-full" : ""} ${
                        widget.isMaximized ? "col-span-full row-span-full" : ""
                      }
                      ${widget.isMinimized ? "h-16" : ""}`}
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-xl flex justify-between items-center">
                        <h3 className="font-medium text-lg">{widget.title}</h3>
                        <WidgetMenu
                          widgetId={widget.id}
                          onRefresh={() => handleRefresh(widget.id)}
                          onMinimize={() => handleMinimize(widget.id)}
                          onMaximize={() => handleMaximize(widget.id)}
                        />
                      </div>
                      {!widget.isMinimized && (
                        <motion.div
                          className="p-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {widget.id === "calendar" && (
                            <Calendar userId={userId} userRole="STAFF" />
                          )}
                          {widget.id === "financial" && <FinancialWidget />}
                          {widget.id === "staff" && <StaffOverview />}
                          {widget.id === "stock" && <StockWidget />}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
