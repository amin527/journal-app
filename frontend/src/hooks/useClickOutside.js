import { useEffect } from "react";

export default function useClickOutside(menu, setMenu, menuRef, journalRef) {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menu.visible && menuRef.current && !menuRef.current.contains(event.target)) {
                setMenu({ ...menu, visible: false });
            }
        };

        const handleRightClickOutside = (event) => {
            if (menu.visible && menuRef.current && !menuRef.current.contains(event.target) && !journalRef.current.contains(event.target)) {
                setMenu({ ...menu, visible: false });
            }
        };
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("contextmenu", handleRightClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("contextmenu", handleRightClickOutside);
        };
    }, [menu, setMenu, menuRef, journalRef ]);
}
