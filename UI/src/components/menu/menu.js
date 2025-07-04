import React from "react";
import Select from "react-dropdown-select";
import './menu.css';

function Menu(props) {
    const [menu, setMenu] = React.useState(props.menu);
    const [menuList, setMenuList] = React.useState([]);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    React.useEffect(() => {
        let menus = [];
        
        props.menulist.map((value, index) => {
            if (value.SHOWDASHBOARD == "true") {
                menus.push({
                    value: value.NAME,
                    label: value.NAME
                });
            }
        });
        setMenuList(menus);
      }, [props]);
    

    const setValue = (values) => {

        props.menulist.map((value, index)=>{
            if(value.NAME == values[0].value)window.location.href = window.location.origin + `/${value.USECASE}?domain=${value.DEFAULT_DOMAIN}`;
        });
    }

    return (
        <div className="menu-drop-down">
            <Select options={menuList} onChange={(values) => setValue(values)} placeholder="Menu" searchable={false}/>
            {/* <Select options={menuList} onChange={(values) => setValues(values)} values={[{label: menu}]} /> */}
        </div>
    )
}

export default Menu;