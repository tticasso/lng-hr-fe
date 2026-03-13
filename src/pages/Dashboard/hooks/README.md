# Dashboard Custom Hooks

## 📚 Tổng quan

Custom hooks giúp tách logic ra khỏi component, làm code dễ đọc, dễ test và dễ tái sử dụng.

---

## 🎣 Danh sách Hooks

### 1. `useDashboardData`
**Mục đích:** Fetch tất cả data cho Dashboard

**Returns:**
```javascript
{
  mySheetData,      // Dữ liệu chấm công tháng hiện tại
  leaveRequests,    // Danh sách yêu cầu nghỉ phép
  otRequests,       // Danh sách yêu cầu OT
  announcements,    // Danh sách thông báo (3 mới nhất)
  loading,          // Trạng thái loading
  error             // Lỗi nếu có
}
```

**Đặc điểm:**
- Gộp 4 API calls chạy song song với `Promise.all()`
- Auto cleanup với `isMounted` flag
- Process announcements data (map category, priority)
- Loading và error handling

**Usage:**
```javascript
const { mySheetData, leaveRequests, otRequests, announcements, loading } = useDashboardData();
```

---

### 2. `useDashboardModals`
**Mục đích:** Quản lý tất cả modals trong Dashboard

**Returns:**
```javascript
{
  // Leave Modal
  isLeaveModalOpen,
  openLeaveModal,
  closeLeaveModal,
  submitLeaveRequest,

  // OT Modal
  isOTModalOpen,
  openOTModal,
  closeOTModal,
  submitOTRequest,

  // HR Support Modal
  isHRSupportModalOpen,
  openHRSupportModal,
  closeHRSupportModal,

  // Announcement Modal
  isAnnouncementModalOpen,
  selectedAnnouncementId,
  openAnnouncementModal,
  closeAnnouncementModal,
}
```

**Đặc điểm:**
- Tất cả handlers được memoized với `useCallback`
- Tích hợp API calls và toast notifications
- Error handling cho từng modal

**Usage:**
```javascript
const {
  isLeaveModalOpen,
  openLeaveModal,
  submitLeaveRequest
} = useDashboardModals();

// Trong JSX
<button onClick={openLeaveModal}>Xin nghỉ phép</button>
<LeaveModal 
  isOpen={isLeaveModalOpen}
  onSubmit={submitLeaveRequest}
/>
```

---

### 3. `useDashboardComputed`
**Mục đích:** Tính toán các giá trị computed

**Parameters:**
```javascript
useDashboardComputed(mySheetData, leaveRequests, otRequests)
```

**Returns:**
```javascript
{
  summaryStats,     // Stats cho tháng hiện tại (3 items)
  requests,         // 3 requests mới nhất (leave + OT)
  pendingCount,     // Số lượng requests pending
  approvedCount     // Số lượng requests approved
}
```

**Đặc điểm:**
- Tất cả values được memoized với `useMemo`
- Chỉ re-calculate khi dependencies thay đổi
- Map leaveType và otType sang tiếng Việt

**Usage:**
```javascript
const { summaryStats, requests, pendingCount, approvedCount } = 
  useDashboardComputed(mySheetData, leaveRequests, otRequests);
```

---

### 4. `useSocketHandler`
**Mục đích:** Xử lý Socket connections

**Returns:**
```javascript
{
  handleSocketData  // Callback để xử lý socket data
}
```

**Đặc điểm:**
- Handler được memoized với `useCallback`
- Chỉ log trong development mode
- Có thể mở rộng để handle notifications, refresh data, etc.

**Usage:**
```javascript
useSocketHandler(); // Tự động connect và handle
```

---

## 🎯 Lợi ích của Custom Hooks

### 1. Separation of Concerns
```javascript
// ❌ TRƯỚC: Tất cả logic trong component
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 50+ dòng fetch logic
  }, []);
  
  const handleSubmit = async () => {
    // 20+ dòng submit logic
  };
  
  // 100+ dòng JSX
};

// ✅ SAU: Logic tách ra hooks
const Dashboard = () => {
  const { data, loading } = useDashboardData();
  const { openModal, submitRequest } = useDashboardModals();
  
  // 30 dòng JSX sạch sẽ
};
```

### 2. Reusability
Hooks có thể tái sử dụng ở nhiều components:
```javascript
// Trong Dashboard
const { mySheetData } = useDashboardData();

// Trong MyProfile (nếu cần)
const { mySheetData } = useDashboardData();
```

### 3. Testability
Dễ dàng test từng hook riêng biệt:
```javascript
import { renderHook } from '@testing-library/react-hooks';
import { useDashboardData } from './useDashboardData';

test('should fetch dashboard data', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useDashboardData());
  
  expect(result.current.loading).toBe(true);
  await waitForNextUpdate();
  expect(result.current.loading).toBe(false);
  expect(result.current.mySheetData).toBeDefined();
});
```

### 4. Maintainability
Dễ dàng tìm và sửa logic:
- Cần sửa API call? → Vào `useDashboardData.js`
- Cần sửa modal logic? → Vào `useDashboardModals.js`
- Cần sửa computed values? → Vào `useDashboardComputed.js`

---

## 📊 So sánh Before/After

| Aspect | Before | After |
|--------|--------|-------|
| Dashboard.jsx | 180 dòng | ~100 dòng |
| Logic location | Trong component | Trong hooks |
| Testability | Khó | Dễ |
| Reusability | Không | Có |
| Readability | Trung bình | Tốt |

---

## 🚀 Kết quả

Dashboard.jsx giờ chỉ còn:
- Import hooks
- Gọi hooks
- Render JSX

**Clean, simple, maintainable! ✅**
