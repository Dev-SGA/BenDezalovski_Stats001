import Image from "next/image";

type AthleteProfileCardProps = {
  name: string;
  club: string;
  photoSrc: string;
  clubLogoSrc: string;
};

export function AthleteProfileCard({ name, club, photoSrc, clubLogoSrc }: AthleteProfileCardProps) {
  return (
    <aside className="athlete-column" aria-label="Athlete profile">
      <div className="athlete-photo">
        <Image
          src={photoSrc}
          alt={name}
          width={340}
          height={453}
          className="athlete-photo__img"
          priority
          sizes="(max-width: 900px) 100vw, 340px"
        />
      </div>
      <div className="athlete-details">
        <p className="athlete-details__label">Athlete</p>
        <h2 className="athlete-details__name">{name}</h2>
        <div className="athlete-details__club">
          <Image
            src={clubLogoSrc}
            alt={`${club} logo`}
            width={56}
            height={56}
            className="athlete-details__club-logo"
          />
          <div>
            <p className="athlete-details__club-label">Club</p>
            <p className="athlete-details__club-name">{club}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
