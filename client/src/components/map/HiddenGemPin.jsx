import LocationPin from './LocationPin';

export default function HiddenGemPin(props) {
  return <LocationPin {...props} stop={{ ...props.stop, hiddenGem: true }} />;
}
