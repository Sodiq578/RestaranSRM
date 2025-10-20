import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { FaUtensils, FaTable, FaTrash, FaEdit, FaPlus, FaSearch, FaUndo, FaTag } from "react-icons/fa";

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

  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    category: "",
    isBestSeller: false,
    image: null,
    imagePreview: "",
  });
  const [newTableName, setNewTableName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editMenuItem, setEditMenuItem] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [deletedItems, setDeletedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const pasteAreaRef = useRef(null);

  // Handle clipboard paste for images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (editMenuItem) {
              setEditMenuItem({
                ...editMenuItem,
                image: file,
                imagePreview: reader.result,
              });
            } else {
              setNewMenuItem({
                ...newMenuItem,
                image: file,
                imagePreview: reader.result,
              });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    const pasteArea = pasteAreaRef.current;
    pasteArea?.addEventListener("paste", handlePaste);
    return () => pasteArea?.removeEventListener("paste", handlePaste);
  }, [editMenuItem]);

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditMenuItem({
            ...editMenuItem,
            image: file,
            imagePreview: reader.result,
          });
        } else {
          setNewMenuItem({
            ...newMenuItem,
            image: file,
            imagePreview: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!newMenuItem.category) {
      alert("Iltimos, kategoriyani tanlang!");
      return;
    }
    addMenuItem({
      ...newMenuItem,
      price: Number(newMenuItem.price),
      isBestSeller: newMenuItem.isBestSeller === "true",
    });
    setNewMenuItem({
      name: "",
      price: "",
      category: "",
      isBestSeller: false,
      image: null,
      imagePreview: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdateMenuItem = (id) => {
    if (!editMenuItem.category) {
      alert("Iltimos, kategoriyani tanlang!");
      return;
    }
    updateMenuItem(id, {
      ...editMenuItem,
      price: Number(editMenuItem.price),
      isBestSeller: editMenuItem.isBestSeller === "true",
    });
    setEditMenuItem(null);
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (newTableName) {
      addTable(newTableName);
      setNewTableName("");
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName) {
      addCategory(newCategoryName);
      setNewCategoryName("");
    }
  };

  const handleUpdateCategory = (id) => {
    if (editCategory.name) {
      updateCategory(id, editCategory.name);
      setEditCategory(null);
    }
  };

  const handleDeleteMenuItem = (id) => {
    const item = menu.find((item) => item.id === id);
    setDeletedItems([...deletedItems, { ...item, type: "menu" }]);
    deleteMenuItem(id);
  };

  const handleDeleteCategory = (id) => {
    const category = categories.find((cat) => cat.id === id);
    setDeletedItems([...deletedItems, { ...category, type: "category" }]);
    deleteCategory(id);
  };

  const handleDeleteTable = (id) => {
    const table = tables.find((table) => table.id === id);
    setDeletedItems([...deletedItems, { ...table, type: "table" }]);
    deleteTable(id);
  };

  const handleRestoreItem = (item) => {
    if (item.type === "menu") {
      addMenuItem(item);
    } else if (item.type === "category") {
      addCategory(item.name);
    } else if (item.type === "table") {
      addTable(item.name);
    }
    setDeletedItems(deletedItems.filter((i) => i.id !== item.id));
  };

  const removeImage = (isEdit = false) => {
    if (isEdit) {
      setEditMenuItem({
        ...editMenuItem,
        image: null,
        imagePreview: "",
      });
      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    } else {
      setNewMenuItem({
        ...newMenuItem,
        image: null,
        imagePreview: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
    <div className="admin-panel" ref={pasteAreaRef}>
      <style jsx>{`
        .admin-panel {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .admin-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .admin-subtitle {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .nav-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .nav-tab {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-tab.active {
          background-color: #3498db;
          color: white;
        }

        .nav-tab:hover {
          background-color: #e8f4fd;
          color: #2c3e50;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .section:hover {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .form-input, .form-select {
          padding: 0.75rem 1rem;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .form-select {
          background-color: white;
          cursor: pointer;
        }

        .file-upload {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .file-input {
          position: absolute;
          left: -9999px;
          opacity: 0;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border: 2px dashed #ced4da;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background-color: #f8f9fa;
        }

        .file-label:hover {
          border-color: #3498db;
          background-color: #e8f4fd;
        }

        .file-icon {
          font-size: 2rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .image-preview {
          position: relative;
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .preview-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .remove-image {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(231, 76, 60, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-danger {
          background-color: #e74c3c;
          color: white;
        }

        .btn-restore {
          background-color: #2ecc71;
          color: white;
        }

        .menu-grid, .tables-grid, .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .menu-item, .table-card, .category-card, .deleted-item {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e9ecef;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .menu-item:hover, .table-card:hover, .category-card:hover, .deleted-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .menu-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .menu-item h3, .category-card h3, .deleted-item h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #27ae60;
          margin-bottom: 0.5rem;
        }

        .category, .category-count {
          display: inline-block;
          background-color: #e8f4fd;
          color: #3498db;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .best-seller {
          display: inline-block;
          background-color: #fff8e1;
          color: #f39c12;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .menu-actions, .edit-form-actions, .table-actions, .category-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .edit-form {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 2rem;
          margin-top: 2rem;
          border: 1px solid #e9ecef;
        }

        .edit-form-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }

        .search-container {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 500px;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e9ecef;
          color: #7f8c8d;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #95a5a6;
        }

        @media (max-width: 768px) {
          .admin-panel {
            padding: 1rem;
          }

          .form-grid, .menu-grid, .tables-grid, .categories-grid {
            grid-template-columns: 1fr;
          }

          .menu-actions, .edit-form-actions, .table-actions, .category-actions {
            flex-direction: column;
          }

          .nav-tabs {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">Admin Paneli</h1>
        <p className="admin-subtitle">Menyu, kategoriya va stollarni boshqarish</p>
      </div>

      <div className="nav-tabs">
        <div
          className={`nav-tab ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          <FaUtensils /> Menyu
        </div>
        <div
          className={`nav-tab ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          <FaTag /> Kategoriyalar
        </div>
        <div
          className={`nav-tab ${activeTab === "tables" ? "active" : ""}`}
          onClick={() => setActiveTab("tables")}
        >
          <FaTable /> Stollar
        </div>
        <div
          className={`nav-tab ${activeTab === "deleted" ? "active" : ""}`}
          onClick={() => setActiveTab("deleted")}
        >
          <FaTrash /> O'chirilganlar
        </div>
      </div>

      {activeTab === "menu" && (
        <section className="section">
          <h2 className="section-title">
            <FaUtensils /> Menyu Boshqaruvi
          </h2>

          <div className="search-container">
            <FaSearch />
            <input
              type="text"
              placeholder="Taom yoki kategoriya bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <form onSubmit={handleAddMenuItem} className="form-grid">
            <div className="form-group">
              <label className="form-label">Taom nomi</label>
              <input
                type="text"
                placeholder="Taom nomi"
                value={newMenuItem.name}
                onChange={(e) =>
                  setNewMenuItem({ ...newMenuItem, name: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Narxi</label>
              <input
                type="number"
                placeholder="Narxi"
                value={newMenuItem.price}
                onChange={(e) =>
                  setNewMenuItem({ ...newMenuItem, price: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategoriya</label>
              <select
                value={newMenuItem.category}
                onChange={(e) =>
                  setNewMenuItem({ ...newMenuItem, category: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Holati</label>
              <select
                value={newMenuItem.isBestSeller}
                onChange={(e) =>
                  setNewMenuItem({ ...newMenuItem, isBestSeller: e.target.value })
                }
                className="form-select"
              >
                <option value={false}>Oddiy</option>
                <option value={true}>Eng ko'p sotilgan</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Taom rasmi (yoki Ctrl+V bilan qo'yish)</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, false)}
                  className="file-input"
                  ref={fileInputRef}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="file-label">
                  <div className="file-icon">📷</div>
                  <div className="file-text">Rasm yuklash uchun bosing</div>
                  <small>PNG, JPG, JPEG (Max: 5MB) yoki Ctrl+V</small>
                </label>
              </div>

              {newMenuItem.imagePreview && (
                <div className="image-preview">
                  <img
                    src={newMenuItem.imagePreview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(false)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn btn-primary">
                <FaPlus /> Taom Qo'shish
              </button>
            </div>
          </form>

          {filteredMenu.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <p>Hech qanday taom topilmadi</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <div key={item.id} className="menu-item">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="menu-image" />
                  )}
                  <h3>{item.name}</h3>
                  <p className="price">{item.price} UZS</p>
                  <span className="category">{item.category}</span>
                  {item.isBestSeller && (
                    <span className="best-seller">Eng ko'p sotilgan</span>
                  )}
                  <div className="menu-actions">
                    <button
                      onClick={() => setEditMenuItem(item)}
                      className="btn btn-primary"
                    >
                      <FaEdit /> Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="btn btn-danger"
                    >
                      <FaTrash /> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editMenuItem && (
            <div className="edit-form">
              <h3 className="edit-form-title">Taomni Tahrirlash</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateMenuItem(editMenuItem.id);
                }}
                className="form-grid"
              >
                <div className="form-group">
                  <label className="form-label">Taom nomi</label>
                  <input
                    type="text"
                    value={editMenuItem.name}
                    onChange={(e) =>
                      setEditMenuItem({ ...editMenuItem, name: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Narxi</label>
                  <input
                    type="number"
                    value={editMenuItem.price}
                    onChange={(e) =>
                      setEditMenuItem({ ...editMenuItem, price: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategoriya</label>
                  <select
                    value={editMenuItem.category}
                    onChange={(e) =>
                      setEditMenuItem({ ...editMenuItem, category: e.target.value })
                    }
                    className="form-select"
                    required
                  >
                    <option value="">Kategoriyani tanlang</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Holati</label>
                  <select
                    value={editMenuItem.isBestSeller}
                    onChange={(e) =>
                      setEditMenuItem({
                        ...editMenuItem,
                        isBestSeller: e.target.value,
                      })
                    }
                    className="form-select"
                  >
                    <option value={false}>Oddiy</option>
                    <option value={true}>Eng ko'p sotilgan</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Taom rasmi (yoki Ctrl+V bilan qo'yish)</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, true)}
                      className="file-input"
                      ref={editFileInputRef}
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="file-label">
                      <div className="file-icon">📷</div>
                      <div className="file-text">Rasm yangilash uchun bosing</div>
                      <small>PNG, JPG, JPEG (Max: 5MB) yoki Ctrl+V</small>
                    </label>
                  </div>

                  {(editMenuItem.imagePreview || editMenuItem.image) && (
                    <div className="image-preview">
                      <img
                        src={editMenuItem.imagePreview || editMenuItem.image}
                        alt="Preview"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(true)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <div className="edit-form-actions">
                  <button type="submit" className="btn btn-primary">
                    <FaPlus /> Saqlash
                  </button>
                  <button
                    onClick={() => setEditMenuItem(null)}
                    className="btn btn-secondary"
                  >
                    Bekor Qilish
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}

      {activeTab === "categories" && (
        <section className="section">
          <h2 className="section-title">
            <FaTag /> Kategoriya Boshqaruvi
          </h2>

          <form onSubmit={handleAddCategory} className="form-grid">
            <div className="form-group">
              <label className="form-label">Kategoriya nomi</label>
              <input
                type="text"
                placeholder="Kategoriya nomi"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary" style={{ marginTop: "1.75rem" }}>
                <FaPlus /> Kategoriya Qo'shish
              </button>
            </div>
          </form>

          {categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏷️</div>
              <p>Hech qanday kategoriya topilmadi</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categoryStats.map((cat) => (
                <div key={cat.id} className="category-card">
                  <h3>{cat.name}</h3>
                  <span className="category-count">Taomlar soni: {cat.count}</span>
                  <div className="category-actions">
                    <button
                      onClick={() => setEditCategory(cat)}
                      className="btn btn-primary"
                    >
                      <FaEdit /> Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="btn btn-danger"
                    >
                      <FaTrash /> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editCategory && (
            <div className="edit-form">
              <h3 className="edit-form-title">Kategoriyani Tahrirlash</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateCategory(editCategory.id);
                }}
                className="form-grid"
              >
                <div className="form-group">
                  <label className="form-label">Kategoriya nomi</label>
                  <input
                    type="text"
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, name: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div className="edit-form-actions">
                  <button type="submit" className="btn btn-primary">
                    <FaPlus /> Saqlash
                  </button>
                  <button
                    onClick={() => setEditCategory(null)}
                    className="btn btn-secondary"
                  >
                    Bekor Qilish
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}

      {activeTab === "tables" && (
        <section className="section">
          <h2 className="section-title">
            <FaTable /> Stollar Boshqaruvi
          </h2>

          <form onSubmit={handleAddTable} className="form-grid">
            <div className="form-group">
              <label className="form-label">Stol nomi</label>
              <input
                type="text"
                placeholder="Stol nomi"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary" style={{ marginTop: "1.75rem" }}>
                <FaPlus /> Stol Qo'shish
              </button>
            </div>
          </form>

          {tables.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🪑</div>
              <p>Hech qanday stol topilmadi</p>
            </div>
          ) : (
            <div className="tables-grid">
              {tables.map((table) => (
                <div key={table.id} className="table-card">
                  <div className="table-number">{table.name}</div>
                  <div className="form-group">
                    <label className="form-label">Ofitsiant ismi</label>
                    <input
                      type="text"
                      placeholder="Ofitsiant ismi"
                      value={table.waiter || ""}
                      onChange={(e) => updateTableWaiter(table.id, e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="table-actions">
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="btn btn-danger"
                    >
                      <FaTrash /> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "deleted" && (
        <section className="section">
          <h2 className="section-title">
            <FaTrash /> O'chirilgan Elementlar
          </h2>

          {deletedItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗑️</div>
              <p>Hech qanday o'chirilgan elementlar topilmadi</p>
            </div>
          ) : (
            <div className="menu-grid">
              {deletedItems.map((item) => (
                <div key={item.id} className="deleted-item">
                  <h3>
                    {item.type === "menu"
                      ? item.name
                      : item.type === "category"
                      ? `Kategoriya: ${item.name}`
                      : `Stol: ${item.name}`}
                  </h3>
                  {item.type === "menu" && (
                    <>
                      <p className="price">{item.price} UZS</p>
                      <span className="category">{item.category}</span>
                      {item.isBestSeller && (
                        <span className="best-seller">Eng ko'p sotilgan</span>
                      )}
                    </>
                  )}
                  <div className="menu-actions">
                    <button
                      onClick={() => handleRestoreItem(item)}
                      className="btn btn-restore"
                    >
                      <FaUndo /> Qayta Tiklash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminPanel;