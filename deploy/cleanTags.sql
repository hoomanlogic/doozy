delete t
--select *
from Tags t left join ActionsTags at on t.Id = at.TagId 
where at.TagId is null and t.Kind != 'Focus'