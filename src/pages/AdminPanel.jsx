// src/components/AdminPanel.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { 
  FaUtensils, 
  FaTable, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaSearch, 
  FaUndo, 
  FaTag,
  FaTimes,
  FaImage,
  FaClipboardList,
  FaStore
} from "react-icons/fa";
import "./AdminPanel.css";

function AdminPanel() {
  const {
    menu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    tables,
    addTable,
    deleteTable,
    updateTableWaiter,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useContext(AppContext);

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    isBestSeller: false,
    image: null,
    imagePreview: "",
  });

  const [newTableName, setNewTableName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletedItems, setDeletedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const pasteAreaRef = useRef(null);

  // Clipboard paste for images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onloadend = () => {
            const data = reader.result;
            if (editingItem) {
              setEditingItem({ ...editingItem, image: file, imagePreview: data });
            } else {
              setNewItem({ ...newItem, image: file, imagePreview: data });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    const el = pasteAreaRef.current;
    el?.addEventListener("paste", handlePaste);
    return () => el?.removeEventListener("paste", handlePaste);
  }, [editingItem, newItem]);

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result;
      if (isEdit) {
        setEditingItem({ ...editingItem, image: file, imagePreview: data });
      } else {
        setNewItem({ ...newItem, image: file, imagePreview: data });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (isEdit = false) => {
    if (isEdit) {
      setEditingItem({ ...editingItem, image: null, imagePreview: "" });
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    } else {
      setNewItem({ ...newItem, image: null, imagePreview: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.category) {
      alert("Iltimos, kategoriyani tanlang!");
      return;
    }
    addMenuItem({
      ...newItem,
      price: Number(newItem.price),
      isBestSeller: Boolean(newItem.isBestSeller),
    });
    setNewItem({ name: "", price: "", category: "", isBestSeller: false, image: null, imagePreview: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateItem = (id) => {
    if (!editingItem.category) {
      alert("Iltimos, kategoriyani tanlang!");
      return;
    }
    updateMenuItem(id, {
      ...editingItem,
      price: Number(editingItem.price),
      isBestSeller: Boolean(editingItem.isBestSeller),
    });
    setEditingItem(null);
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (newTableName.trim()) {
      addTable(newTableName.trim());
      setNewTableName("");
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  const handleUpdateCategory = (id) => {
    if (editingCategory.name.trim()) {
      updateCategory(id, editingCategory.name.trim());
      setEditingCategory(null);
    }
  };

  const handleDeleteItem = (id) => {
    const item = menu.find((i) => i.id === id);
    if (item) {
      setDeletedItems([...deletedItems, { ...item, type: "menu" }]);
      deleteMenuItem(id);
    }
  };

  const handleDeleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setDeletedItems([...deletedItems, { ...cat, type: "category" }]);
      deleteCategory(id);
    }
  };

  const handleDeleteTable = (id) => {
    const table = tables.find((t) => t.id === id);
    if (table) {
      setDeletedItems([...deletedItems, { ...table, type: "table" }]);
      deleteTable(id);
    }
  };

  const handleRestore = (item) => {
    if (item.type === "menu") addMenuItem(item);
    else if (item.type === "category") addCategory(item.name);
    else if (item.type === "table") addTable(item.name);
    setDeletedItems(deletedItems.filter((i) => i.id !== item.id));
  };

  const filteredMenu = menu.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryStats = categories.map((cat) => ({
    ...cat,
    count: menu.filter((item) => item.category === cat.name).length,
  }));

  return (
    <div className="admin-wrap" ref={pasteAreaRef}>
      <div className="admin-head">
        <h1 className="admin-head-title">⚙️ Admin Paneli</h1>
        <p className="admin-head-sub">Menyu, kategoriya va stollarni boshqarish</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { key: "menu", icon: <FaUtensils />, label: "Menyu" },
          { key: "categories", icon: <FaTag />, label: "Kategoriyalar" },
          { key: "tables", icon: <FaTable />, label: "Stollar" },
          { key: "deleted", icon: <FaTrash />, label: "O'chirilganlar" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== MENU TAB ===== */}
      {activeTab === "menu" && (
        <div className="admin-section">
          <div className="admin-section-head">
            <h2 className="admin-section-title"><FaUtensils /> Menyu Boshqaruvi</h2>
          </div>

          <div className="admin-search">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Taom yoki kategoriya bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <form onSubmit={handleAddItem} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-field">
                <label className="admin-label">Taom nomi</label>
                <input
                  type="text"
                  placeholder="Taom nomi"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Narxi (UZS)</label>
                <input
                  type="number"
                  placeholder="Narxi"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Kategoriya</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="admin-select"
                  required
                >
                  <option value="">Tanlang</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">Holati</label>
                <select
                  value={newItem.isBestSeller}
                  onChange={(e) => setNewItem({ ...newItem, isBestSeller: e.target.value === "true" })}
                  className="admin-select"
                >
                  <option value="false">Oddiy</option>
                  <option value="true">⭐ Eng ko'p sotilgan</option>
                </select>
              </div>
            </div>

            <div className="admin-form-row admin-form-image">
              <div className="admin-field admin-field-full">
                <label className="admin-label">Rasm (Ctrl+V bilan ham qo'shishingiz mumkin)</label>
                <div className="admin-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="admin-upload-input"
                    ref={fileInputRef}
                    id="upload-btn"
                  />
                  <label htmlFor="upload-btn" className="admin-upload-label">
                    <FaImage /> Rasm yuklash
                  </label>
                  {newItem.imagePreview && (
                    <div className="admin-preview">
                      <img src={newItem.imagePreview} alt="Preview" className="admin-preview-img" />
                      <button type="button" className="admin-preview-remove" onClick={() => removeImage(false)}>
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary">
              <FaPlus /> Qo'shish
            </button>
          </form>

          <div className="admin-grid">
            {filteredMenu.length === 0 ? (
              <div className="admin-empty">🍽️ Hech qanday taom topilmadi</div>
            ) : (
              filteredMenu.map((item) => (
                <div key={item.id} className="admin-card">
                  {item.imagePreview || item.image ? (
                    <img src={item.imagePreview || item.image} alt={item.name} className="admin-card-img" />
                  ) : (
                    <div className="admin-card-img-placeholder"><FaUtensils /></div>
                  )}
                  <div className="admin-card-body">
                    <h3 className="admin-card-title">{item.name}</h3>
                    <p className="admin-card-price">{Number(item.price).toLocaleString()} UZS</p>
                    <div className="admin-card-tags">
                      <span className="admin-tag admin-tag-cat">{item.category}</span>
                      {item.isBestSeller && <span className="admin-tag admin-tag-best">⭐ Mashhur</span>}
                    </div>
                    <div className="admin-card-actions">
                      <button className="admin-btn admin-btn-edit" onClick={() => setEditingItem(item)}>
                        <FaEdit /> Tahrirlash
                      </button>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteItem(item.id)}>
                        <FaTrash /> O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Edit Modal */}
          {editingItem && (
            <div className="admin-modal-overlay" onClick={() => setEditingItem(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-head">
                  <h3><FaEdit /> Taomni Tahrirlash</h3>
                  <button className="admin-modal-close" onClick={() => setEditingItem(null)}><FaTimes /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateItem(editingItem.id); }} className="admin-form">
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label className="admin-label">Taom nomi</label>
                      <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="admin-input" required />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Narxi</label>
                      <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} className="admin-input" required />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label className="admin-label">Kategoriya</label>
                      <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="admin-select" required>
                        <option value="">Tanlang</option>
                        {categories.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                      </select>
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Holati</label>
                      <select value={editingItem.isBestSeller} onChange={(e) => setEditingItem({ ...editingItem, isBestSeller: e.target.value === "true" })} className="admin-select">
                        <option value="false">Oddiy</option>
                        <option value="true">⭐ Mashhur</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-field admin-field-full">
                      <label className="admin-label">Rasm</label>
                      <div className="admin-upload">
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} className="admin-upload-input" ref={editFileInputRef} id="edit-upload" />
                        <label htmlFor="edit-upload" className="admin-upload-label"><FaImage /> Yangilash</label>
                        {(editingItem.imagePreview || editingItem.image) && (
                          <div className="admin-preview">
                            <img src={editingItem.imagePreview || editingItem.image} alt="Preview" className="admin-preview-img" />
                            <button type="button" className="admin-preview-remove" onClick={() => removeImage(true)}><FaTimes /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="admin-modal-actions">
                    <button type="submit" className="admin-btn admin-btn-primary"><FaPlus /> Saqlash</button>
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingItem(null)}>Bekor qilish</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== CATEGORIES TAB ===== */}
      {activeTab === "categories" && (
        <div className="admin-section">
          <div className="admin-section-head">
            <h2 className="admin-section-title"><FaTag /> Kategoriya Boshqaruvi</h2>
          </div>

          <form onSubmit={handleAddCategory} className="admin-form admin-form-inline">
            <div className="admin-field admin-field-inline">
              <label className="admin-label">Kategoriya nomi</label>
              <input type="text" placeholder="Yangi kategoriya" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="admin-input" required />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary"><FaPlus /> Qo'shish</button>
          </form>

          <div className="admin-grid admin-grid-categories">
            {categories.length === 0 ? (
              <div className="admin-empty">🏷️ Hech qanday kategoriya mavjud emas</div>
            ) : (
              categoryStats.map((cat) => (
                <div key={cat.id} className="admin-card admin-card-category">
                  <div className="admin-card-body">
                    <h3 className="admin-card-title">{cat.name}</h3>
                    <p className="admin-card-sub">{cat.count} ta taom</p>
                    <div className="admin-card-actions">
                      <button className="admin-btn admin-btn-edit" onClick={() => setEditingCategory(cat)}><FaEdit /> Tahrirlash</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteCategory(cat.id)}><FaTrash /> O'chirish</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {editingCategory && (
            <div className="admin-modal-overlay" onClick={() => setEditingCategory(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-head">
                  <h3><FaEdit /> Kategoriyani Tahrirlash</h3>
                  <button className="admin-modal-close" onClick={() => setEditingCategory(null)}><FaTimes /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateCategory(editingCategory.id); }} className="admin-form">
                  <div className="admin-field">
                    <label className="admin-label">Kategoriya nomi</label>
                    <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="admin-input" required />
                  </div>
                  <div className="admin-modal-actions">
                    <button type="submit" className="admin-btn admin-btn-primary"><FaPlus /> Saqlash</button>
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingCategory(null)}>Bekor qilish</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TABLES TAB ===== */}
      {activeTab === "tables" && (
        <div className="admin-section">
          <div className="admin-section-head">
            <h2 className="admin-section-title"><FaTable /> Stollar Boshqaruvi</h2>
          </div>

          <form onSubmit={handleAddTable} className="admin-form admin-form-inline">
            <div className="admin-field admin-field-inline">
              <label className="admin-label">Stol nomi</label>
              <input type="text" placeholder="Masalan: Stol 1" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} className="admin-input" required />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary"><FaPlus /> Qo'shish</button>
          </form>

          <div className="admin-grid admin-grid-tables">
            {tables.length === 0 ? (
              <div className="admin-empty">🪑 Hech qanday stol mavjud emas</div>
            ) : (
              tables.map((table) => (
                <div key={table.id} className="admin-card admin-card-table">
                  <div className="admin-card-body">
                    <h3 className="admin-card-title"><FaTable /> {table.name}</h3>
                    <div className="admin-field admin-field-inline admin-field-small">
                      <label className="admin-label">Ofitsiant</label>
                      <input
                        type="text"
                        placeholder="Ofitsiant ismi"
                        value={table.waiter || ""}
                        onChange={(e) => updateTableWaiter(table.id, e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-card-actions">
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteTable(table.id)}><FaTrash /> O'chirish</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== DELETED TAB ===== */}
      {activeTab === "deleted" && (
        <div className="admin-section">
          <div className="admin-section-head">
            <h2 className="admin-section-title"><FaTrash /> O'chirilgan Elementlar</h2>
          </div>

          {deletedItems.length === 0 ? (
            <div className="admin-empty">🗑️ Hech qanday o'chirilgan element yo'q</div>
          ) : (
            <div className="admin-grid">
              {deletedItems.map((item) => (
                <div key={item.id} className="admin-card admin-card-deleted">
                  <div className="admin-card-body">
                    <h3 className="admin-card-title">
                      {item.type === "menu" ? item.name : item.type === "category" ? `🏷️ ${item.name}` : `🪑 ${item.name}`}
                    </h3>
                    {item.type === "menu" && (
                      <>
                        <p className="admin-card-price">{Number(item.price).toLocaleString()} UZS</p>
                        <div className="admin-card-tags">
                          <span className="admin-tag admin-tag-cat">{item.category}</span>
                          {item.isBestSeller && <span className="admin-tag admin-tag-best">⭐ Mashhur</span>}
                        </div>
                      </>
                    )}
                    <div className="admin-card-actions">
                      <button className="admin-btn admin-btn-restore" onClick={() => handleRestore(item)}>
                        <FaUndo /> Qayta tiklash
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;