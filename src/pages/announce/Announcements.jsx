import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import React, { useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Bold,
  Italic,
  List,
  AlignLeft,
  CheckCircle2,
  Send,
  Save,
  ArrowLeft,
  Users,
  BarChart2,
  MoveLeft,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const Announcements = () => {
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState(""); // để preview / submit
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Soạn thảo nội dung thông báo tại đây...",
      }),
      Image.configure({
        inline: false,
        allowBase64: false, // khuyến nghị: không lưu base64 trong DB
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "flex-1 w-full p-4 outline-none resize-none text-gray-700 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      setContentHtml(editor.getHTML());
    },
  });

  // State quản lý màn hình: 'list' | 'create' | 'edit'
  const [currentView, setCurrentView] = useState("list");

  const announcements = [
    {
      id: 1,
      title: "Thông báo lịch nghỉ Tết Nguyên Đán 2026",
      tag: "Holiday",
      author: "Nguyễn Văn An",
      avatar: "NA",
      date: "05/01/2026",
      status: "Published",
      views: 145,
      totalUsers: 150,
    },
    {
      id: 2,
      title: "Cập nhật chính sách làm việc từ xa (WFH)",
      tag: "Policy",
      author: "Trần Thị B",
      avatar: "TB",
      date: "10/01/2026",
      status: "Scheduled",
      scheduleDate: "15/01/2026 08:00",
      views: 0,
      totalUsers: 150,
    },
    {
      id: 3,
      title: "Year End Party 2025 - Save the Date!",
      tag: "Event",
      author: "Lê Văn C",
      avatar: "LC",
      date: "01/12/2025",
      status: "Archived",
      views: 130,
      totalUsers: 140,
    },
    {
      id: 4,
      title: "Chào mừng nhân sự mới tháng 12",
      tag: "HR Notice",
      author: "Nguyễn Văn An",
      avatar: "NA",
      date: "Updated 2 mins ago",
      status: "Draft",
      views: 0,
      totalUsers: 0,
    },
  ];

  // Helper render Tag Badge
  const renderTag = (tag) => {
    const styles = {
      Holiday: "bg-red-50 text-red-600 border-red-100",
      Policy: "bg-blue-50 text-blue-600 border-blue-100",
      Event: "bg-orange-50 text-orange-600 border-orange-100",
      "HR Notice": "bg-purple-50 text-purple-600 border-purple-100",
      Others: "bg-gray-50 text-gray-600 border-gray-100",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wide ${
          styles[tag] || styles["Others"]
        }`}
      >
        {tag}
      </span>
    );
  };

  // Helper render Status Badge
  const renderStatus = (status) => {
    const styles = {
      Published: "bg-green-100 text-green-700",
      Scheduled: "bg-indigo-50 text-indigo-600",
      Draft: "bg-gray-100 text-gray-500",
      Archived: "bg-slate-100 text-slate-500 line-through",
    };
    const icons = {
      Published: <CheckCircle2 size={12} />,
      Scheduled: <Clock size={12} />,
      Draft: <FileText size={12} />,
      Archived: <FileText size={12} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}
      >
        {icons[status]} {status}
      </span>
    );
  };

  // --- VIEW 1: ANNOUNCEMENT LIST ---
  const renderListView = () => (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý thông báo (Not yet active)
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý thông báo nội bộ gửi đến toàn công ty.
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
          onClick={() => setCurrentView("create")}
        >
          <Plus size={18} /> Tạo Thông Báo
        </Button>
      </div>

      {/* Toolbar & Filter */}
      <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative max-w-md w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[140px] focus:border-blue-500 outline-none">
              <option>All Types</option>
              <option>Holiday</option>
              <option>Policy</option>
              <option>Event</option>
            </select>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[140px] focus:border-blue-500 outline-none">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
          </div>
          <Button variant="secondary" className="px-3">
            <Filter size={16} />
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 w-[40%]">Tiêu đề thông báo</th>
                <th className="p-4">Người tạo</th>
                <th className="p-4">Ngày đăng / Lên lịch</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Lượt xem (Reach)</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {announcements.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/50 group transition-colors"
                >
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-800 text-base group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer">
                        {item.title}
                      </span>
                      <div>{renderTag(item.tag)}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {item.avatar}
                      </div>
                      <span className="text-gray-600">{item.author}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs">
                    {item.status === "Scheduled" ? (
                      <span className="text-indigo-600 flex items-center gap-1">
                        <Clock size={12} /> {item.scheduleDate}
                      </span>
                    ) : (
                      item.date
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {renderStatus(item.status)}
                  </td>
                  <td className="p-4">
                    {item.status === "Published" ||
                    item.status === "Archived" ? (
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-gray-700">
                            {item.views}/{item.totalUsers}
                          </span>
                          <span className="text-gray-400">
                            {Math.round((item.views / item.totalUsers) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(item.views / item.totalUsers) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">--</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2  transition-opacity">
                      <button
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        title="Analytics"
                      >
                        <BarChart2 size={16} />
                      </button>
                      <button
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                        title="Archive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // --- VIEW 2: EDITOR (CREATE/EDIT) ---
  const renderEditorView = () => (
    <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right-4 duration-300">
      {/* Editor Header */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setCurrentView("list")}
            className="w-10 h-10 p-0 rounded-full border-gray-200"
          >
            <MoveLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentView === "create"
                ? "Tạo Thông Báo Mới  "
                : "Chỉnh Sửa Thông Báo"}
            </h1>
            <p className="text-sm text-gray-500">
              Soạn thảo nội dung, đính kèm tệp và thiết lập lịch gửi.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setCurrentView("list")}>
            Cancel
          </Button>
          <Button variant="secondary" className="text-gray-600 border-gray-300">
            <Save size={18} className="mr-2" /> Save Draft
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <Send size={18} className="mr-2" /> Publish Now
          </Button>
        </div>
      </div>

      {/* Editor Content Layout (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main Form (Left - 2 Cols) */}
        <Card className="lg:col-span-2 h-full flex flex-col p-6 overflow-y-auto border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Nhập tiêu đề..."
                className="w-full text-lg font-bold border-b-2 border-gray-200 px-0 py-2 focus:border-blue-500 focus:outline-none placeholder-gray-300 transition-colors"
              />
            </div>

            {/* Simulated Rich Text Editor */}
            <div className="flex flex-col border border-gray-300 rounded-lg overflow-hidden min-h-[400px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              {/* Toolbar */}
              <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold size={16} />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic size={16} />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                >
                  <List size={16} />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editor) return;

                    // 1) upload ảnh lên server / cloud -> lấy URL
                    // const url = await uploadAnnouncementImage(file);

                    // 2) chèn ảnh vào nội dung
                    editor
                      .chain()
                      .focus()
                      .setImage({ src: "", alt: file.name })
                      .run();

                    // reset để chọn lại cùng 1 file vẫn trigger change
                    e.target.value = "";
                  }}
                />

                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600">
                  <Paperclip size={16} />
                </button>
              </div>
              <div className="flex-1">
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Đính kèm tệp
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                  <Paperclip size={20} />
                </div>
                <p className="text-sm text-gray-600">
                  Kéo thả tệp vào đây hoặc{" "}
                  <span className="text-blue-600 font-bold hover:underline">
                    tải lên
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Hỗ trợ PDF, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sidebar Settings (Right - 1 Col) */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <Card className="p-5 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">
              Thiết lập đăng tin
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại thông báo (Category)
                </label>
                <select className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none">
                  <option>HR Notice</option>
                  <option>Policy Update</option>
                  <option>Event</option>
                  <option>Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian đăng
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      defaultChecked
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Đăng ngay (Publish Now)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Lên lịch (Schedule)
                    </span>
                  </label>
                </div>
                {/* Date Picker Simulator */}
                <div className="mt-3 pl-6">
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng nhận tin
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      defaultChecked
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Users size={14} /> Toàn công ty
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Phòng ban cụ thể
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
            <div className="shrink-0 text-blue-600 mt-0.5">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800">Lưu ý</p>
              <p className="text-xs text-blue-700 mt-1">
                Thông báo quan trọng (Policy/Holiday) sẽ được ghim lên Dashboard
                của nhân viên trong 3 ngày.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)]">
      {currentView === "list" ? renderListView() : renderEditorView()}
    </div>
  );
};

export default Announcements;
