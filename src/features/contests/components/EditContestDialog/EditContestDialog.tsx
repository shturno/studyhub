"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { useEditContestDialog } from "./useEditContestDialog";
import type { EditContestDialogProps } from "./types";

export function EditContestDialog({ contest }: EditContestDialogProps) {
  const t = useTranslations("EditContestDialog");
  const { open, setOpen, form, onSubmit } = useEditContestDialog({ contest });
  const [examDateText, setExamDateText] = useState(
    contest.examDate ? format(new Date(contest.examDate), "dd/MM/yyyy") : "",
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-[#7b61ff] transition-all p-1"
          aria-label={t("editLabel")}
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("institutionLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("roleLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="examDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("examDateLabel")}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="dd/mm/aaaa"
                        className="w-full font-mono text-base"
                        value={examDateText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamDateText(val);
                          if (!val) { field.onChange(null); return; }
                          const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                          if (match) {
                            const d = new Date(+match[3], +match[2] - 1, +match[1]);
                            if (!isNaN(d.getTime())) field.onChange(d);
                          }
                        }}
                      />
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-12 px-0 flex-shrink-0"
                        >
                          <CalendarIcon className="h-4 w-4 opacity-50 text-[#00ff41]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-50 pointer-events-auto"
                        align="end"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={(date) => {
                            field.onChange(date ?? null);
                            setExamDateText(date ? format(date, "dd/MM/yyyy") : "");
                          }}
                          className="pointer-events-auto"
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem
                  className="flex flex-row items-center justify-between p-4"
                  style={{
                    border: "1px solid rgba(0,255,65,0.3)",
                    background: "#020008",
                  }}
                >
                  <div className="space-y-0.5">
                    <FormLabel>{t("mainFocusLabel")}</FormLabel>
                    <FormDescription>{t("mainFocusDescription")}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full">
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
