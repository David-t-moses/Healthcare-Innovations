"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "flex justify-center select-none rounded-md border",
        className
      )}
      classNames={{
        months: "relative py-4 flex flex-col",
        month: "text-center w-full space-y-4",
        caption:
          "relative flex flex-col items-center text-center justify-center gap-1 px-8 py-4 mx-auto",
        caption_label:
          "text-lg font-semibold flex flex-col text-center item-center justify center bg-blue-600 w-[52%] max-[385px]:text-[10px] text-white mx-auto rounded-2xl",
        nav: "absolute w-full flex items-center justify-between gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 hover:bg-blue-600/10"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: cn(
          "text-center text-muted-foreground font-medium text-xs uppercase tracking-wider py-4"
        ),
        row: "grid grid-cols-7",
        cell: cn(
          "relative h-12 w-full p-0 text-center focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-blue-600/10 focus-within:bg-blue-600/5"
        ),
        day: cn(
          "h-10 w-10 text-center p-0 mx-auto font-normal rounded-full transition-all duration-200",
          "hover:bg-blue-600 hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
          "aria-selected:bg-blue-600 aria-selected:text-white aria-selected:hover:bg-blue-600 aria-selected:hover:text-white"
        ),
        day_selected: cn(
          "bg-blue-600 text-white hover:bg-blue-700",
          "focus:bg-blue-600 focus:text-white focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        ),
        day_today: cn(
          "bg-accent/50 text-accent-foreground",
          "before:absolute before:bottom-1 before:left-1/2 before:h-1 before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-blue-600"
        ),
        day_outside: "text-muted-foreground/50",
        day_disabled: "text-muted-foreground/50",
        day_range_middle: "aria-selected:bg-accent",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ArrowLeft className="h-5 w-5" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ArrowRight className="h-5 w-5" {...props} />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
