"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"  // Import cn utility for conditional class names

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const currentDate = new Date()
  const defaultYear = currentDate.getFullYear() - 18 // 18 years ago
  const defaultMonth = currentDate.getMonth() // Current month

  const [year, setYear] = React.useState(defaultYear)
  const [month, setMonth] = React.useState(new Date(defaultYear, defaultMonth)) // Set default to the current month 18 years ago

  // Generate years (100 years ago till the current year)
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 101 }, (_, i) => currentYear - 100 + i)  // Show 100 years before current year, up to the current year
  }, [])

  const handleYearSelect = (selectedYear: string) => {
    const newDate = new Date(month)
    newDate.setFullYear(parseInt(selectedYear))
    setYear(parseInt(selectedYear))
    setMonth(newDate)
  }

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth)
    const newYear = newMonth.getFullYear()
    if (newYear !== year) {
      setYear(newYear)  // Update year when crossing into a new year
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        <Select
          value={year.toString()}
          onValueChange={handleYearSelect}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="max-h-[140px] overflow-y-auto"> {/* Display 3-4 years at a time */}
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <DayPicker
        month={month}
        onMonthChange={handleMonthChange} // Update month and year when month changes
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 p-0 opacity-50 hover:opacity-100 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" // Transparent background for arrows
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
          IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
        }}
        // Reduce height for a more compact look, no empty space for extra rows
        style={{ height: '320px' }} // Adjust to remove empty row spaces, fits perfectly in 5 rows of calendar
        {...props}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
