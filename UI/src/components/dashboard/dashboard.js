import './dashboard.css';
import dashboardBG from '../../assets/dashboard_bg.png';
import uc1 from '../../assets/uc1.png';
import uc2 from '../../assets/uc2.png';
import uc3 from '../../assets/uc3.png';
import uc4 from '../../assets/uc4.png';
import uc5 from '../../assets/uc5.png';
import uc6 from '../../assets/uc4.png';

const imageList = [uc1, uc2, uc3, uc4, uc5, uc6];

function Dashboard(props) {
    const onClick = url => {
        window.location.href = window.location.origin + url;
    }

    return (
        <div className='dashboard-overlay' style={{ backgroundImage: `url(${dashboardBG})` }}>
            <div className='dashboard-inner-wrapper'>
                <div className='dashboard-top-wrapper'>
                    <h1>{props.uiText.DASHBOARD_TITLE}</h1>
                    <h3>{props.uiText.DASHBOARD_DESC}</h3>
                </div>
                <div className='dahboard-menu-wrapper'>
                    {
                        props.useCases.USECASES.map((value, index) => {
                            if (value.NAME.charAt(0) != '_' && value.DESCRIPTION.charAt(0) != '_' && value.SHOWDASHBOARD == "true") {
                                return (
                                    <div className='menu-row' onClick={() => { onClick(`/${value.USECASE}?domain=${value.DEFAULT_DOMAIN}`) }}>
                                        <div className='icon'>
                                            <img src={imageList[index]}></img>
                                        </div>
                                        <div className='desc'>
                                            <p className='name'>{value.NAME}</p>
                                            <p className='dsc'>{value.DESCRIPTION}</p>
                                        </div>
                                    </div>

                                )
                            }
                        })
                    }
                </div>

            </div>
            <div className='footer-wrapper'>
                <div className="divider"></div>
                <p className='footer'>{props.uiText.DASHBOARD_FOOTER}</p>
            </div>

        </div>
    )
}

export default Dashboard;