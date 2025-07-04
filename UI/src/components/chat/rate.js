import React from "react";
import thumbs_down_default from '../../assets/thumbs/thumbs_down_diabled.png';
import thumbs_down_active from '../../assets/thumbs/thumbs_down_filled.png';
import thumbs_down_hover from '../../assets/thumbs/thumbs_down_hover.png';
import thumbs_up_default from '../../assets/thumbs/thumbs_up_diabled.png';
import thumbs_up_active from '../../assets/thumbs/thumbs_up_filled.png';
import thumbs_up_hover from '../../assets/thumbs/thumbs_up_hover.png';

function Rate(props) {
    const [liked, setLiked] = React.useState(props.thumbs == 'Up' ? 1 : props.thumbs == 'Down' ? 0 : null);
    const [uphover, setUphover] = React.useState(false);
    const [downhover, setDownhover] = React.useState(false);

    const onLike = () => {
        setLiked(1);
        props.rating(1);
    };

    const onDislike = () => {
        setLiked(0);
        props.rating(0);
    };

    return (
        <span className="ratings">
            {
                liked == 1 ? <i onClick={onLike} title="Like"><img src={thumbs_up_active}></img></i>: <i onClick={onLike}  onMouseEnter={()=>{setUphover(true)}} onMouseLeave={()=>{setDownhover(false);setUphover(false);}} title="Like">{!uphover? <img src={thumbs_up_default}></img>: <img src={thumbs_up_hover}></img>}</i>
            }
            {
                liked == 0 ? <i onClick={onDislike} title="Dislike"><img src={thumbs_down_active}></img></i>: <i onClick={onDislike} title="Dislike"  onMouseEnter={()=>{setDownhover(true);}} onMouseLeave={()=>{setDownhover(false);setUphover(false);}}>{!downhover ? <img src={thumbs_down_default}></img>: <img src={thumbs_down_hover}></img>}</i>
            }
        </span>
    )
}

export default Rate;