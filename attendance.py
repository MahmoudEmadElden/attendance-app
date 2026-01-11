import tkinter as tk
from tkinter import messagebox
import csv
from datetime import datetime
import os

FILE_NAME = "attendance.csv"

# إنشاء ملف CSV لو مش موجود
if not os.path.exists(FILE_NAME):
    with open(FILE_NAME, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Date", "Status", "Overtime Hours", "Notes"])

def save_attendance():
    date = date_entry.get()
    status = status_var.get()
    overtime = overtime_entry.get()
    notes = notes_text.get("1.0", tk.END).strip()

    if date == "" or status == "":
        messagebox.showerror("خطأ", "من فضلك أكمل البيانات الأساسية")
        return

    if overtime == "":
        overtime = "0"

    with open(FILE_NAME, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([date, status, overtime, notes])

    messagebox.showinfo("تم", "✅ تم تسجيل اليوم بنجاح")

    overtime_entry.delete(0, tk.END)
    notes_text.delete("1.0", tk.END)

# ================= GUI =================
root = tk.Tk()
root.title("برنامج تسجيل الحضور")
root.geometry("420x300")
root.resizable(False, False)

# ====== العنوان ======
tk.Label(root, text="تسجيل الحضور اليومي", font=("Arial", 16, "bold")).pack(pady=10)

frame = tk.Frame(root)
frame.pack(pady=10)

# ====== التاريخ ======
tk.Label(frame, text="التاريخ:").grid(row=0, column=0, sticky="w")
date_entry = tk.Entry(frame, width=15)
date_entry.grid(row=0, column=1, padx=10)
date_entry.insert(0, datetime.now().strftime("%Y-%m-%d"))

# ====== الحالة + الإضافي ======
tk.Label(frame, text="الحالة:").grid(row=1, column=0, sticky="w", pady=10)

status_var = tk.StringVar()
tk.Radiobutton(frame, text="حضور", variable=status_var, value="حضور").grid(row=1, column=1, sticky="w")
tk.Radiobutton(frame, text="غياب", variable=status_var, value="غياب").grid(row=1, column=1, padx=70, sticky="w")

tk.Label(frame, text="ساعات إضافية:").grid(row=1, column=2, padx=10)
overtime_entry = tk.Entry(frame, width=5)
overtime_entry.grid(row=1, column=3)

# ====== الملاحظات ======
tk.Label(frame, text="ملاحظات:").grid(row=2, column=0, sticky="nw", pady=10)
notes_text = tk.Text(frame, width=30, height=4)
notes_text.grid(row=2, column=1, columnspan=3, pady=10)

# ====== زر الحفظ ======
tk.Button(
    root,
    text="💾 حفظ",
    command=save_attendance,
    bg="#4CAF50",
    fg="white",
    width=20
).pack(pady=15)

root.mainloop()
