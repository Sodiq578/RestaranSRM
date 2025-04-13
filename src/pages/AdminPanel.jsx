import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import "./AdminPanel.css";

function AdminPanel() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, tables, addTable, deleteTable, updateTableWaiter, user } = useContext(AppContext);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", isBestSeller: false });
  const [editItem, setEditItem] = useState(null);
  const [newTableName, setNewTableName] = useState("");
  const [editWaiter, setEditWaiter] = useState({ id: null, waiter: "" });

  if (!user) {
    return (
      <div className="auth-message">
        <h2>Iltimos, tizimga kiring!</h2>
      </div>
    );
  }

  const handleAddMenu = () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }
    addMenuItem({
      name: newItem.name,
      price: parseInt(newItem.price),
      category: newItem.category,
      isBestSeller: newItem.isBestSeller,
    });
    setNewItem({ name: "", price: "", category: "", isBestSeller: false });
  };

  const handleEditMenu = (item) => {
    setEditItem(item);
  };

  const handleUpdateMenu = () => {
    if (!editItem.name || !editItem.price || !editItem.category) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }
    updateMenuItem(editItem.id, {
      name: editItem.name,
      price: parseInt(editItem.price),
      category: editItem.category,
      isBestSeller: editItem.isBestSeller,
    });
    setEditItem(null);
  };

  const handleAddTable = () => {
    if (!newTableName) {
      alert("Stol nomini kiriting!");
      return;
    }
    addTable(newTableName);
    setNewTableName("");
  };

  const handleEditWaiter = (table) => {
    setEditWaiter({ id: table.id, waiter: table.waiter });
  };

  const handleUpdateWaiter = () => {
    if (!editWaiter.waiter) {
      alert("Ofitsiant nomini kiriting!");
      return;
    }
    updateTableWaiter(editWaiter.id, editWaiter.waiter);
    setEditWaiter({ id: null, waiter: "" });
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {/* Taom qo‘shish/tahrirlash */}
      <section className="card">
        <h2>{editItem ? "Taomni tahrirlash" : "Yangi taom qo‘shish"}</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Taom nomi"
            value={editItem ? editItem.name : newItem.name}
            onChange={(e) =>
              editItem
                ? setEditItem({ ...editItem, name: e.target.value })
                : setNewItem({ ...newItem, name: e.target.value })
            }
            aria-label="Taom nomi"
          />
          <input
            type="number"
            placeholder="Narxi (so‘m)"
            value={editItem ? editItem.price : newItem.price}
            onChange={(e) =>
              editItem
                ? setEditItem({ ...editItem, price: e.target.value })
                : setNewItem({ ...newItem, price: e.target.value })
            }
            aria-label="Narxi"
          />
          <input
            type="text"
            placeholder="Kategoriya"
            value={editItem ? editItem.category : newItem.category}
            onChange={(e) =>
              editItem
                ? setEditItem({ ...editItem, category: e.target.value })
                : setNewItem({ ...newItem, category: e.target.value })
            }
            aria-label="Kategoriya"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={editItem ? editItem.isBestSeller : newItem.isBestSeller}
              onChange={(e) =>
                editItem
                  ? setEditItem({ ...editItem, isBestSeller: e.target.checked })
                  : setNewItem({ ...newItem, isBestSeller: e.target.checked })
              }
              aria-label="Eng ko‘p sotilgan"
            />
            Eng ko‘p sotilgan
          </label>
          <div className="button-group">
            <button onClick={editItem ? handleUpdateMenu : handleAddMenu} aria-label={editItem ? "Yangilash" : "Qo‘shish"}>
              {editItem ? "Yangilash" : "Qo‘shish"}
            </button>
            {editItem && (
              <button className="cancel-btn" onClick={() => setEditItem(null)} aria-label="Bekor qilish">
                Bekor qilish
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Taomlar ro‘yxati */}
      <section className="card">
        <h2>Menyu ro‘yxati</h2>
        {menu.length === 0 ? (
          <p className="empty-message">Menyu bo‘sh</p>
        ) : (
          <div className="table-container">
            {menu.map((item) => (
              <div className="menu-card" key={item.id}>
                <div className="menu-info">
                  <h3>{item.name}</h3>
                  <p><strong>Narxi:</strong> {item.price.toLocaleString()} so‘m</p>
                  <p><strong>Kategoriya:</strong> {item.category}</p>
                  <p><strong>Eng ko‘p sotilgan:</strong> {item.isBestSeller ? "Ha" : "Yo‘q"}</p>
                </div>
                <div className="menu-actions">
                  <button onClick={() => handleEditMenu(item)} aria-label="Tahrirlash">
                    Tahrirlash
                  </button>
                  <button className="delete-btn" onClick={() => deleteMenuItem(item.id)} aria-label="O‘chirish">
                    O‘chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stollar boshqaruvi */}
      <section className="card">
        <h2>Yangi stol qo‘shish</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Stol nomi"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            aria-label="Stol nomi"
          />
          <button onClick={handleAddTable} aria-label="Qo‘shish">
            Qo‘shish
          </button>
        </div>
      </section>

      {/* Stollar ro‘yxati */}
      <section className="card">
        <h2>Stollar ro‘yxati</h2>
        {tables.length === 0 ? (
          <p className="empty-message">Stollar yo‘q</p>
        ) : (
          <div className="table-container">
            {tables.map((table) => (
              <div className="table-card" key={table.id}>
                <div className="table-info">
                  <h3>{table.name}</h3>
                  <p>
                    <strong>Ofitsiant:</strong>{" "}
                    {editWaiter.id === table.id ? (
                      <div className="edit-waiter">
                        <input
                          type="text"
                          value={editWaiter.waiter}
                          onChange={(e) => setEditWaiter({ ...editWaiter, waiter: e.target.value })}
                          placeholder="Ofitsiant ismi"
                          aria-label="Ofitsiant ismi"
                        />
                        <button onClick={handleUpdateWaiter} aria-label="Saqlash">
                          Saqlash
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditWaiter({ id: null, waiter: "" })}
                          aria-label="Bekor qilish"
                        >
                          Bekor
                        </button>
                      </div>
                    ) : (
                      table.waiter || "Belgilanmagan"
                    )}
                  </p>
                </div>
                <div className="table-actions">
                  <button onClick={() => handleEditWaiter(table)} aria-label="Ofitsiantni tahrirlash">
                    Ofitsiantni tahrirlash
                  </button>
                  <button className="delete-btn" onClick={() => deleteTable(table.id)} aria-label="O‘chirish">
                    O‘chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPanel;