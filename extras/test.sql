select g.* from (select distinct on (f.drug_id, f.rank) f.* from (select p1.id, p1.name, p1.drug_id, p1.rank, p1.dosage_strength, p1.quantity, p1.ndc, p1.gsn, p1.recommended_price, p1.zip_code,
	coalesce(p1.unc_price, p2.unc_price) as unc_price, 
	coalesce(p1.insiderx_price, p2.insiderx_price) as insiderx_price,
	coalesce(p1.insiderx_pharmacy, p2.insiderx_pharmacy) as insiderx_pharmacy,
	coalesce(p1.pharm_price, p2.pharm_price) as pharm_price,
	coalesce(p1.pharm_pharmacy, p2.pharm_pharmacy) as pharm_pharmacy,
	coalesce(p1.wellrx_price, p2.wellrx_price) as wellrx_price,
	coalesce(p1.wellrx_pharmacy, p2.wellrx_pharmacy) as wellrx_pharmacy,
	coalesce(p1.medimpact_price, p2.medimpact_price) as medimpact_price,
	coalesce(p1.medimpact_pharmacy, p2.medimpact_pharmacy) as medimpact_pharmacy,
	coalesce(p1.singlecare_price, p2.singlecare_price) as singlecare_price,
	coalesce(p1.singlecare_pharmacy, p2.singlecare_pharmacy) as singlecare_pharmacy,
	coalesce(p1.singlecare_price, p2.singlecare_price) as singlecare_price,
	coalesce(p1.singlecare_pharmacy, p2.singlecare_pharmacy) as singlecare_pharmacy,
	coalesce(p1.goodrx_price, p2.goodrx_price) as goodrx_price,
	coalesce(p1.goodrx_pharmacy, p2.goodrx_pharmacy) as goodrx_pharmacy,
	coalesce(p1.blink_price, p2.blink_price) as blink_price,
	coalesce(p1.blink_pharmacy, p2.blink_pharmacy) as blink_pharmacy
from (
Select ROW_NUMBER() OVER (ORDER BY s.name) AS id , *
from (           (
    SELECT
      t.name, t.rank, t.drug_id, t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM 
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 0
      order by name) t

    GROUP BY t.name , t.dosage_strength,t.rank,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price,t.unc_price, t.zip_code
    ORDER BY t.name, t.dosage_strength
    )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 1
      order by drug_id) t

    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 2) t

    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 3) t

    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.rank, price.unc_price
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 4) t
    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )) s
 ORDER BY name ,dosage_strength, rank
) p1 full outer join (
Select ROW_NUMBER() OVER (ORDER BY s.name) AS id , *
from (           (
    SELECT
      t.name, t.rank, t.drug_id, t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 0
      order by name) t

    GROUP BY t.name , t.dosage_strength,t.rank,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price,t.unc_price, t.zip_code
    ORDER BY t.name, t.dosage_strength
    )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 1
      order by drug_id) t

    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 2) t

    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 3) t

    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )
  union all
    (SELECT
      t.name, t.rank, t.drug_id,
      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,
      max(case when t.program_id = 0  then t.price end) AS insiderx_price,
      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,
      max(case when t.program_id = 1  then t.price end) AS pharm_price,
      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,
      max(case when t.program_id = 2  then t.price end) AS wellrx_price,
      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,
      max(case when t.program_id = 3  then t.price end) AS medimpact_price,
      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,
      max(case when t.program_id = 4  then t.price end) AS singlecare_price,
      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,
      max(case when t.program_id = 6  then t.price end) AS goodrx_price,
      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,
      max(case when t.program_id = 5  then t.price end) AS blink_price ,
      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy
    FROM
      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,
        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.rank, price.unc_price
      from report_drugs full outer join price on  price.id = report_drugs.price_id
        full outer join drug_master on price.drug_details_id = drug_master.id
      where report_drugs.report_id = ?1 and drug_master.zip_code = ?2 and price.rank = 4) t
    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank
    ORDER BY t.name, t.dosage_strength )) s
where s.unc_price is not null ORDER BY name ,dosage_strength, rank
) p2 on p1.rank = p2.rank and p1.drug_id = p2.drug_id ) f ) g order by g.name, g.gsn, g.rank
